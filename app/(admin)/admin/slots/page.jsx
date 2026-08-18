import { listZones } from "@/lib/zones/actions";
import { listSlotsByZone } from "@/lib/slots/actions";
import { SlotManager } from "./SlotManager";

export default async function AdminSlotsPage({ searchParams }) {
  const params = await searchParams;
  const zones = await listZones();
  const zoneId = params?.zoneId || zones[0]?.$id || "";
  const slots = zoneId ? await listSlotsByZone(zoneId) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Parking Slots</h1>
        <p className="text-muted-foreground">Add, edit, or disable individual slots within a zone.</p>
      </div>
      <SlotManager zones={zones} selectedZoneId={zoneId} initialSlots={slots} />
    </div>
  );
}
