const STATUS_STYLES = {
  available:
    "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  occupied:
    "bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
  reserved:
    "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  maintenance: "bg-muted text-muted-foreground border-border",
};

export function SlotCard({ slot }) {
  const style = STATUS_STYLES[slot.status] || STATUS_STYLES.maintenance;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 rounded-md border p-2 text-xs font-medium ${style}`}
      title={`${slot.slotCode} — ${slot.status}`}
    >
      <span className="font-semibold">{slot.slotCode}</span>
      <span className="capitalize opacity-80">{slot.status}</span>
    </div>
  );
}
