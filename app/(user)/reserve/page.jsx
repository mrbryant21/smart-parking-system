import { listZones } from "@/lib/zones/actions";
import { listMyVehicles } from "@/lib/vehicles/actions";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { ReserveForm } from "./ReserveForm";

export default async function ReservePage() {
  const [zones, vehicles, current] = await Promise.all([
    listZones(),
    listMyVehicles(),
    getCurrentUserWithProfile(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reserve a Slot</h1>
        <p className="text-muted-foreground">
          Tell us where you&apos;re headed — we&apos;ll allocate the closest available slot.
        </p>
      </div>
      <ReserveForm
        zones={zones ?? []}
        vehicles={vehicles ?? []}
        role={current?.profile?.role || "student"}
      />
    </div>
  );
}
