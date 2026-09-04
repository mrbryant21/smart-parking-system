"use client";

export function ZoneTabs({ zones, selectedId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {zones.map((z) => {
        const isActive = z.$id === selectedId;
        return (
          <button
            key={z.$id}
            type="button"
            onClick={() => onSelect(z.$id)}
            className={
              isActive
                ? "rounded-full border border-transparent bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors"
                : "rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {z.name}
          </button>
        );
      })}
    </div>
  );
}
