"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUS_COLORS = {
  available: "#10b981",
  occupied: "#ef4444",
  reserved: "#f59e0b",
  maintenance: "#9ca3af",
};

export function OccupancyMiniChart({ occupancy }) {
  const total = occupancy.reduce((sum, o) => sum + o.count, 0);

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={occupancy} dataKey="count" nameKey="status" innerRadius={45} outerRadius={70}>
              {occupancy.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#9ca3af"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
        {occupancy.map((o) => (
          <div key={o.status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[o.status] || "#9ca3af" }}
            />
            <span className="capitalize text-muted-foreground">
              {o.status} ({total > 0 ? Math.round((o.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
