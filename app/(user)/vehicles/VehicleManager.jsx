"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
} from "@/lib/vehicles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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

const VEHICLE_TYPES = ["car", "motorcycle", "van", "bus", "other"];

export function VehicleManager({ initialVehicles }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(
    (initialVehicles ?? []).filter((v) => v && v.$id),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function refreshFromServer() {
    router.refresh();
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createVehicleAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setAddOpen(false);
    refreshFromServer();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!editing?.$id) {
      setError("No vehicle selected for editing.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("vehicleId", editing.$id);

    const result = await updateVehicleAction(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setEditing(null);
    refreshFromServer();
  }

  async function handleDelete(vehicleId) {
    setVehicles((prev) => prev.filter((v) => v && v.$id !== vehicleId));
    await deleteVehicleAction(vehicleId);
    refreshFromServer();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setError(null)}>Add vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add vehicle</DialogTitle>
                <DialogDescription>
                  Register a new vehicle to your account.
                </DialogDescription>
              </DialogHeader>
              <VehicleFields error={error} />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add vehicle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No vehicles yet. Add one to get started.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Brand / Model</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.$id}>
                <TableCell className="font-medium">{v.plateNumber}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {v.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {[v.brand, v.model].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell>{v.color || "—"}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setEditing(v);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete vehicle?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {v.plateNumber} from your account.
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(v.$id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          {editing && (
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit vehicle</DialogTitle>
                <DialogDescription>
                  Update your vehicle details.
                </DialogDescription>
              </DialogHeader>
              <VehicleFields vehicle={editing} error={error} />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VehicleFields({ vehicle, error }) {
  const [type, setType] = useState(vehicle?.type || "car");

  return (
    <div className="flex flex-col gap-4 py-2">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="plateNumber">Plate number</Label>
        <Input
          id="plateNumber"
          name="plateNumber"
          defaultValue={vehicle?.plateNumber}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Vehicle type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VEHICLE_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="type" value={type} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={vehicle?.brand} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={vehicle?.model} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="color">Color</Label>
        <Input id="color" name="color" defaultValue={vehicle?.color} />
      </div>
    </div>
  );
}
