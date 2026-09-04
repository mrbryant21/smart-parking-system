"use client";

import { useState } from "react";
import { ZoneTabs } from "@/components/zone-map/ZoneTabs";
import { SlotCard } from "@/components/zone-map/SlotCard";

export function ParkingMapClient({ zones, slotsByZone }) {
  const [selectedId, setSelectedId] = useState(zones[0]?.$id || "");
  const zone = zones.find((z) => z.$id === selectedId);
  const slots = slotsByZone[selectedId] || [];
  const available = slots.filter((s) => s.status === "available").length;

  if (!zone) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No zones configured yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ZoneTabs zones={zones} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="rounded-2xl border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{zone.name}</h2>
            {zone.nearDepartment && (
              <p className="text-xs text-muted-foreground">Near {zone.nearDepartment}</p>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {available}/{slots.length} available
          </span>
        </div>

        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots configured.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {slots.map((s) => (
              <SlotCard key={s.$id} slot={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
