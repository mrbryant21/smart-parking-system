import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin overview</h1>
        <p className="text-muted-foreground">
          Manage users, vehicles, zones, slots, and reservations across campus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage registered users and roles.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Zones &amp; Slots</CardTitle>
            <CardDescription>Configure parking zones and individual slots.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
            <CardDescription>View and manage active reservations.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Occupancy and usage analytics.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
