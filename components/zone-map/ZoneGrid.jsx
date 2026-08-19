import { SlotCard } from "./SlotCard";

export function ZoneGrid({ zone, slots }) {
  const available = slots.filter((s) => s.status === "available").length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{zone.name}</h3>
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
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {slots.map((s) => (
            <SlotCard key={s.$id} slot={s} />
          ))}
        </div>
      )}
    </div>
  );
}
