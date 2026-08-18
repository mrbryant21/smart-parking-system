import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function DashboardPage() {
  const { profile } = await getCurrentUserWithProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {profile?.name?.split(" ")[0] || "there"}</h1>
        <p className="text-muted-foreground">
          Reserve a parking slot, view your vehicles, or check active reservations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reserve a slot</CardTitle>
            <CardDescription>Find and reserve parking near your destination.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My reservations</CardTitle>
            <CardDescription>View active, expired, and past reservations.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My vehicles</CardTitle>
            <CardDescription>Manage the vehicles registered to your account.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
