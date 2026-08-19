import { Query } from "node-appwrite";
import { listAllReservationsAdmin } from "@/lib/reservations/actions";
import { listAllSlots } from "@/lib/slots/actions";
import { listZones } from "@/lib/zones/actions";
import { createAdminClient } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const STATUS_VARIANT = {
  active: "default",
  expired: "outline",
  cancelled: "outline",
  completed: "secondary",
};

export default async function AdminReservationsPage() {
  const [reservations, slots, zones] = await Promise.all([
    listAllReservationsAdmin(),
    listAllSlots(),
    listZones(),
  ]);

  const slotsById = Object.fromEntries(slots.map((s) => [s.$id, s]));
  const zonesById = Object.fromEntries(zones.map((z) => [z.$id, z]));

  const userIds = [...new Set(reservations.map((r) => r.userId))];
  let usersById = {};

  if (userIds.length > 0) {
    const { databases } = createAdminClient();
    const usersResult = await databases.listDocuments(DB_ID, COLLECTIONS.USERS, [
      Query.equal("$id", userIds),
      Query.limit(100),
    ]);
    usersById = Object.fromEntries(usersResult.documents.map((u) => [u.$id, u]));
  }

  const enriched = reservations.map((r) => {
    const slot = slotsById[r.slotId];
    const zone = slot ? zonesById[slot.zoneId] : null;
    const user = usersById[r.userId];
    return {
      ...r,
      slotCode: slot?.slotCode || "—",
      zoneName: zone?.name || "—",
      userName: user?.name || "Unknown",
      userRole: user?.role || "—",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reservations</h1>
        <p className="text-muted-foreground">All reservations across campus.</p>
      </div>

      {enriched.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reservations yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enriched.map((r) => (
              <TableRow key={r.$id}>
                <TableCell className="font-medium">{r.userName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{r.userRole}</Badge>
                </TableCell>
                <TableCell>{r.slotCode}</TableCell>
                <TableCell>{r.zoneName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status] || "secondary"} className="capitalize">
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>{r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
