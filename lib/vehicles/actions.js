"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

function toPlainList(list) {
  const docs = JSON.parse(JSON.stringify(list?.documents ?? []));
  return docs.filter((doc) => doc && doc.$id);
}

export async function listMyVehicles() {
  const user = await getLoggedInUser();
  if (!user) return [];

  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.VEHICLES, [
    Query.equal("ownerId", user.$id),
    Query.orderDesc("$createdAt"),
  ]);

  return toPlainList(result);
}

export async function createVehicleAction(formData) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };

  const plateNumber = formData.get("plateNumber")?.toString().trim().toUpperCase();
  const type = formData.get("type")?.toString();
  const color = formData.get("color")?.toString().trim() || "";
  const brand = formData.get("brand")?.toString().trim() || "";
  const model = formData.get("model")?.toString().trim() || "";

  if (!plateNumber || !type) {
    return { error: "Plate number and vehicle type are required." };
  }

  const { databases } = createAdminClient();

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.VEHICLES, ID.unique(), {
      ownerId: user.$id,
      plateNumber,
      type,
      color,
      brand,
      model,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not add vehicle." };
  }
}

export async function updateVehicleAction(formData) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };

  const vehicleId = formData.get("vehicleId")?.toString();
  const plateNumber = formData.get("plateNumber")?.toString().trim().toUpperCase();
  const type = formData.get("type")?.toString();
  const color = formData.get("color")?.toString().trim() || "";
  const brand = formData.get("brand")?.toString().trim() || "";
  const model = formData.get("model")?.toString().trim() || "";

  if (!vehicleId || !plateNumber || !type) {
    return { error: "Plate number and vehicle type are required." };
  }

  const { databases } = createAdminClient();

  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.VEHICLES, vehicleId);
    if (existing.ownerId !== user.$id) return { error: "Not authorized." };

    await databases.updateDocument(DB_ID, COLLECTIONS.VEHICLES, vehicleId, {
      plateNumber,
      type,
      color,
      brand,
      model,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update vehicle." };
  }
}

export async function deleteVehicleAction(vehicleId) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };
  if (!vehicleId) return { error: "Missing vehicle." };

  const { databases } = createAdminClient();

  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.VEHICLES, vehicleId);
    if (existing.ownerId !== user.$id) return { error: "Not authorized." };

    await databases.deleteDocument(DB_ID, COLLECTIONS.VEHICLES, vehicleId);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not delete vehicle." };
  }
}
