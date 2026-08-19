import { listZones } from "@/lib/zones/actions";
import { listAllSlots } from "@/lib/slots/actions";
import { ZoneGrid } from "@/components/zone-map/ZoneGrid";

export default async function ParkingMapPage() {
  const [zones, slots] = await Promise.all([listZones(), listAllSlots()]);

  const slotsByZone = {};
  for (const s of slots) {
    (slotsByZone[s.zoneId] ??= []).push(s);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Campus Parking Map</h1>
        <p className="text-muted-foreground">Live occupancy across all zones.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <LegendItem color="bg-emerald-400" label="Available" />
        <LegendItem color="bg-amber-400" label="Reserved" />
        <LegendItem color="bg-red-400" label="Occupied" />
        <LegendItem color="bg-muted-foreground/40" label="Maintenance" />
      </div>

      {zones.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No zones configured yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {zones.map((zone) => (
            <ZoneGrid key={zone.$id} zone={zone} slots={slotsByZone[zone.$id] || []} />
          ))}
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
