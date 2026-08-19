"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createReservationAction } from "@/lib/reservations/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRDisplay } from "@/components/qr/QRDisplay";

export function ReserveForm({ zones: zonesProp, vehicles: vehiclesProp, role }) {
  const router = useRouter();
  const zones = (zonesProp ?? []).filter((z) => z && z.$id);
  const vehicles = (vehiclesProp ?? []).filter((v) => v && v.$id);
  const [destinationZoneId, setDestinationZoneId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!destinationZoneId || !vehicleId) {
      setError("Please select a destination and a vehicle.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("destinationZoneId", destinationZoneId);
    formData.set("vehicleId", vehicleId);
    formData.set("role", role);

    const res = await createReservationAction(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    setResult(res);
    router.refresh();
  }

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No vehicles registered</CardTitle>
          <CardDescription>
            You need at least one registered vehicle before reserving a slot.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/vehicles">Add a vehicle</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (result?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slot reserved</CardTitle>
          <CardDescription>
            Held for 30 minutes — arrive before it expires or the slot is released.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Slot</span>
            <Badge className="text-base">{result.slot.slotCode}</Badge>
          </div>
          <p className="text-sm">
            Zone: <span className="font-medium">{result.zone.name}</span>
          </p>
          {result.isFallback && (
            <p className="text-xs text-muted-foreground">
              Your preferred zone was full — allocated the nearest available zone instead.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Expires at {new Date(result.reservation.expiresAt).toLocaleTimeString()}
          </p>
          <div className="flex flex-col items-center gap-2 pt-2">
            <QRDisplay
              value={`${result.reservation.$id}:${result.reservation.qrCodeToken}`}
              size={180}
            />
            <p className="text-xs text-muted-foreground">
              Show this at the entrance for verification.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button asChild>
            <Link href="/reservations">View my reservations</Link>
          </Button>
          <Button variant="outline" onClick={() => setResult(null)}>
            Reserve another
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Where are you headed?</CardTitle>
        <CardDescription>
          We&apos;ll allocate the closest available slot for your role.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <div className="flex flex-col gap-2">
            <Label>Destination</Label>
            <Select value={destinationZoneId} onValueChange={setDestinationZoneId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a zone or department" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.$id} value={z.$id}>
                    {z.name}
                    {z.nearDepartment ? ` — near ${z.nearDepartment}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.$id} value={v.$id}>
                    {v.plateNumber} {v.brand ? `(${v.brand})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Finding a slot..." : "Reserve slot"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
