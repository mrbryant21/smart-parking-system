import Link from "next/link";
import { Car, CalendarClock, ClipboardList, MapPin, QrCode, ArrowRight } from "lucide-react";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { listMyVehicles } from "@/lib/vehicles/actions";
import { listMyReservations } from "@/lib/reservations/actions";
import { listAllSlots } from "@/lib/slots/actions";
import { listZones } from "@/lib/zones/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/dashboard/StatTile";

const STATUS_VARIANT = {
  active: "default",
  expired: "outline",
  cancelled: "outline",
  completed: "secondary",
};

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [{ profile }, vehicles, reservations, slots, zones] = await Promise.all([
    getCurrentUserWithProfile(),
    listMyVehicles(),
    listMyReservations(),
    listAllSlots(),
    listZones(),
  ]);

  const slotsById = Object.fromEntries(slots.map((s) => [s.$id, s]));
  const zonesById = Object.fromEntries(zones.map((z) => [z.$id, z]));

  const enriched = reservations.map((r) => {
    const slot = slotsById[r.slotId];
    const zone = slot ? zonesById[slot.zoneId] : null;
    return { ...r, slotCode: slot?.slotCode || "—", zoneName: zone?.name || "—" };
  });

  const activeReservation = enriched.find((r) => r.status === "active") || null;
  const recent = enriched.slice(0, 3);
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {greeting}, {profile?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground">
          Reserve a parking slot, view your vehicles, or check active reservations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Car} label="Registered vehicles" value={vehicles.length} />
        <StatTile icon={ClipboardList} label="Total reservations" value={reservations.length} />
        <StatTile
          icon={CalendarClock}
          label="Active reservation"
          value={activeReservation ? activeReservation.slotCode : "None"}
          accent={activeReservation ? "text-emerald-600" : "text-muted-foreground"}
        />
      </div>

      {activeReservation ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {activeReservation.zoneName}
              </CardTitle>
              <CardDescription>
                Slot {activeReservation.slotCode} · Expires{" "}
                {new Date(activeReservation.expiresAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant={STATUS_VARIANT.active}>Active</Badge>
          </CardHeader>
          <CardFooter className="gap-3">
            <Button asChild size="sm">
              <Link href="/reservations">
                <QrCode className="h-4 w-4" /> View QR
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/parking-map">View parking map</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No active reservation</CardTitle>
            <CardDescription>Reserve a slot before you head to campus.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild size="sm">
              <Link href="/reserve">
                Reserve now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLinkCard
          href="/reserve"
          title="Reserve a slot"
          description="Find and reserve parking near your destination."
        />
        <QuickLinkCard
          href="/reservations"
          title="My reservations"
          description={`${reservations.length} total — active, expired, and past.`}
        />
        <QuickLinkCard
          href="/vehicles"
          title="My vehicles"
          description={`${vehicles.length} registered.`}
        />
      </div>

      {recent.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent reservations</h2>
            <Link href="/reservations" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <div
                key={r.$id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[r.status] || "secondary"} className="capitalize">
                    {r.status}
                  </Badge>
                  <span className="font-medium">{r.slotCode}</span>
                  <span className="text-muted-foreground">{r.zoneName}</span>
                </div>
                <span className="text-muted-foreground">
                  {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLinkCard({ href, title, description }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
