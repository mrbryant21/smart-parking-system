export function StatTile({ icon: Icon, label, value, accent = "text-primary" }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-2xl font-semibold leading-none">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
