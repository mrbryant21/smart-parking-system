import { listZones } from "@/lib/zones/actions";
import { getSlotCountsByZone } from "@/lib/slots/actions";
import { ZoneManager } from "./ZoneManager";

export default async function AdminZonesPage() {
  const [zones, slotCounts] = await Promise.all([listZones(), getSlotCountsByZone()]);
  const safeZones = (zones ?? []).filter((z) => z && z.$id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Parking Zones</h1>
        <p className="text-muted-foreground">Divide campus parking into manageable zones.</p>
      </div>
      <ZoneManager initialZones={safeZones} slotCounts={slotCounts} />
    </div>
  );
}
