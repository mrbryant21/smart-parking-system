import { Client, Databases, ID, Query } from "node-appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
const COLLECTIONS = {
  ZONES: "zones-coll",
  SLOTS: "slots-coll",
};

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const ZONES = [
  { name: "Zone A - Computer Science", nearDepartment: "Computer Science Department", description: "Parking closest to the CS building.", slotCount: 8 },
  { name: "Zone B - Engineering", nearDepartment: "Engineering Department", description: "Parking closest to the Engineering block.", slotCount: 8 },
  { name: "Zone C - Sports Complex", nearDepartment: "Sports Complex", description: "Parking near the sports complex and main gate.", slotCount: 6 },
];

async function findExistingZone(name) {
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.ZONES, [
    Query.equal("name", name),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

async function seed() {
  for (const zone of ZONES) {
    let zoneDoc = await findExistingZone(zone.name);

    if (!zoneDoc) {
      zoneDoc = await databases.createDocument(DB_ID, COLLECTIONS.ZONES, ID.unique(), {
        name: zone.name,
        description: zone.description,
        nearDepartment: zone.nearDepartment,
        totalSlots: zone.slotCount,
      });
      console.log(`Created zone: ${zone.name}`);
    } else {
      console.log(`Zone already exists, skipping: ${zone.name}`);
    }

    const prefix = zone.name[5]; // A / B / C
    for (let i = 1; i <= zone.slotCount; i++) {
      const slotCode = `${prefix}${String(i).padStart(3, "0")}`;

      const existingSlot = await databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [
        Query.equal("zoneId", zoneDoc.$id),
        Query.equal("slotCode", slotCode),
        Query.limit(1),
      ]);

      if (existingSlot.total > 0) continue;

      await databases.createDocument(DB_ID, COLLECTIONS.SLOTS, ID.unique(), {
        zoneId: zoneDoc.$id,
        slotCode,
        type: i === zone.slotCount ? "disabled" : "general",
        status: "available",
      });
    }
    console.log(`Ensured ${zone.slotCount} slots for ${zone.name}`);
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
