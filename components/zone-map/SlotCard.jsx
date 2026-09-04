import { Car } from "lucide-react";

const CARD_STYLES = {
  available:
    "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300",
  occupied:
    "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
  reserved:
    "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300",
  maintenance: "bg-muted border-border text-muted-foreground",
};

const ICON_STYLES = {
  available: "bg-emerald-500 text-white",
  occupied: "bg-red-500 text-white",
  reserved: "bg-amber-500 text-white",
  maintenance: "bg-muted-foreground/40 text-white",
};

export function SlotCard({ slot }) {
  const cardStyle = CARD_STYLES[slot.status] || CARD_STYLES.maintenance;
  const iconStyle = ICON_STYLES[slot.status] || ICON_STYLES.maintenance;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 ${cardStyle}`}
      title={`${slot.slotCode} — ${slot.status}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconStyle}`}>
        <Car className="h-4 w-4" />
      </span>
      <span className="text-xs font-semibold">{slot.slotCode}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {slot.status}
      </span>
    </div>
  );
}
