import Link from "next/link";
import { Query } from "node-appwrite";
import { Users, ParkingSquare, ClipboardList, BarChart3, Car, ArrowRight } from "lucide-react";
import { getReportsData } from "@/lib/reports/actions";
import { listAllReservationsAdmin } from "@/lib/reservations/actions";
import { listAllSlots } from "@/lib/slots/actions";
import { listZones } from "@/lib/zones/actions";
import { createAdminClient } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/dashboard/StatTile";
import { OccupancyMiniChart } from "@/components/dashboard/OccupancyMiniChart";

const STATUS_VARIANT = {
  active: "default",
  expired: "outline",
  cancelled: "outline",
  completed: "secondary",
};

export default async function AdminOverviewPage() {
  const [data, reservations, slots, zones] = await Promise.all([
    getReportsData(),
    listAllReservationsAdmin(),
    listAllSlots(),
    listZones(),
  ]);

  const slotsById = Object.fromEntries(slots.map((s) => [s.$id, s]));
  const zonesById = Object.fromEntries(zones.map((z) => [z.$id, z]));
  const recent = reservations.slice(0, 5);

  const userIds = [...new Set(recent.map((r) => r.userId))];
  let usersById = {};

  if (userIds.length > 0) {
    const { databases } = createAdminClient();
    const usersResult = await databases.listDocuments(DB_ID, COLLECTIONS.USERS, [
      Query.equal("$id", userIds),
      Query.limit(100),
    ]);
    usersById = Object.fromEntries(usersResult.documents.map((u) => [u.$id, u]));
  }

  const enrichedRecent = recent.map((r) => {
    const slot = slotsById[r.slotId];
    const zone = slot ? zonesById[slot.zoneId] : null;
    return {
      ...r,
      slotCode: slot?.slotCode || "—",
      zoneName: zone?.name || "—",
      userName: usersById[r.userId]?.name || "Unknown",
    };
  });

  const occupancyRate =
    data && data.totalSlots > 0
      ? Math.round(
          ((data.totalSlots - (data.occupancy.find((o) => o.status === "available")?.count || 0)) /
            data.totalSlots) *
            100
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin overview</h1>
        <p className="text-muted-foreground">
          Manage users, vehicles, zones, slots, and reservations across campus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Users} label="Total users" value={data?.totalUsers ?? "—"} />
        <StatTile icon={ParkingSquare} label="Total slots" value={data?.totalSlots ?? "—"} />
        <StatTile icon={ClipboardList} label="Total reservations" value={data?.totalReservations ?? "—"} />
        <StatTile
          icon={BarChart3}
          label="Occupancy rate"
          value={occupancyRate !== null ? `${occupancyRate}%` : "—"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Live occupancy</CardTitle>
            <CardDescription>Slot status right now.</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <OccupancyMiniChart occupancy={data.occupancy} />
            ) : (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent reservations</h2>
            <Link href="/admin/reservations" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {enrichedRecent.length === 0 ? (
            <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No reservations yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {enrichedRecent.map((r) => (
                <div
                  key={r.$id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[r.status] || "secondary"} className="capitalize">
                      {r.status}
                    </Badge>
                    <span className="font-medium">{r.userName}</span>
                    <span className="text-muted-foreground">
                      {r.slotCode} · {r.zoneName}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLinkCard href="/admin/users" icon={Users} title="Users" description="Manage registered users and roles." />
        <QuickLinkCard href="/admin/zones" icon={ParkingSquare} title="Zones & Slots" description="Configure parking zones and individual slots." />
        <QuickLinkCard href="/admin/vehicles" icon={Car} title="Vehicles" description="Oversee all registered vehicles." />
        <QuickLinkCard href="/admin/reports" icon={BarChart3} title="Reports" description="Occupancy and usage analytics." />
      </div>
    </div>
  );
}

function QuickLinkCard({ href, icon: Icon, title, description }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" /> {title}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
