"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cancelReservationAction } from "@/lib/reservations/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRDisplay } from "@/components/qr/QRDisplay";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_VARIANT = {
  active: "default",
  expired: "outline",
  cancelled: "outline",
  completed: "secondary",
};

export function ReservationList({ initialReservations }) {
  const router = useRouter();
  const reservations = (initialReservations ?? []).filter((r) => r && r.$id);
  const [error, setError] = useState(null);

  async function handleCancel(reservationId) {
    setError(null);
    const result = await cancelReservationAction(reservationId);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No reservations yet.{" "}
        <Link href="/reserve" className="text-foreground hover:underline">
          Reserve a slot
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slot</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((r) => (
            <TableRow key={r.$id}>
              <TableCell className="font-medium">{r.slotCode}</TableCell>
              <TableCell>{r.zoneName}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[r.status] || "secondary"} className="capitalize">
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell>
                {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                {r.status === "active" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View QR</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reservation QR code</DialogTitle>
                        <DialogDescription>
                          Show this at the entrance for slot {r.slotCode}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center py-4">
                        <QRDisplay value={`${r.$id}:${r.qrCodeToken}`} size={200} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {r.status === "active" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Cancel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel reservation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will free up slot {r.slotCode} for other users.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep reservation</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancel(r.$id)}>
                          Cancel reservation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
