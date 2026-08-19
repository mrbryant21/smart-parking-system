import { listMyReservations } from "@/lib/reservations/actions";
import { listAllSlots } from "@/lib/slots/actions";
import { listZones } from "@/lib/zones/actions";
import { ReservationList } from "./ReservationList";

export default async function ReservationsPage() {
  const [reservations, slots, zones] = await Promise.all([
    listMyReservations(),
    listAllSlots(),
    listZones(),
  ]);

  const slotsById = Object.fromEntries(slots.map((s) => [s.$id, s]));
  const zonesById = Object.fromEntries(zones.map((z) => [z.$id, z]));

  const enriched = reservations.map((r) => {
    const slot = slotsById[r.slotId];
    const zone = slot ? zonesById[slot.zoneId] : null;
    return {
      ...r,
      slotCode: slot?.slotCode || "—",
      zoneName: zone?.name || "—",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My Reservations</h1>
        <p className="text-muted-foreground">View and manage your parking reservations.</p>
      </div>
      <ReservationList initialReservations={enriched} />
    </div>
  );
}
