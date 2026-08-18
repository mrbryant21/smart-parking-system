import { listMyVehicles } from "@/lib/vehicles/actions";
import { VehicleManager } from "./VehicleManager";

export default async function VehiclesPage() {
  const vehicles = (await listMyVehicles()) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My Vehicles</h1>
        <p className="text-muted-foreground">Register and manage the vehicles linked to your account.</p>
      </div>
      <VehicleManager initialVehicles={vehicles} />
    </div>
  );
}
