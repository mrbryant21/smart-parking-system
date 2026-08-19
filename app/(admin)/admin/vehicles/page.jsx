import { Query } from "node-appwrite";
import { listAllVehiclesAdmin } from "@/lib/vehicles/actions";
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

export default async function AdminVehiclesPage() {
  const vehicles = await listAllVehiclesAdmin();

  const ownerIds = [...new Set(vehicles.map((v) => v.ownerId))];
  let ownersById = {};

  if (ownerIds.length > 0) {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.USERS, [
      Query.equal("$id", ownerIds),
      Query.limit(200),
    ]);
    ownersById = Object.fromEntries(result.documents.map((u) => [u.$id, u]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <p className="text-muted-foreground">All vehicles registered across campus.</p>
      </div>

      {vehicles.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No vehicles registered yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Brand / Model</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.$id}>
                <TableCell className="font-medium">{v.plateNumber}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{v.type}</Badge>
                </TableCell>
                <TableCell>{[v.brand, v.model].filter(Boolean).join(" ") || "—"}</TableCell>
                <TableCell>{ownersById[v.ownerId]?.name || "Unknown"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
