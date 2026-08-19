"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSlotAction,
  updateSlotAction,
  deleteSlotAction,
  toggleSlotMaintenanceAction,
} from "@/lib/slots/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const SLOT_TYPES = ["general", "staff", "visitor", "disabled"];

const STATUS_VARIANT = {
  available: "secondary",
  occupied: "destructive",
  reserved: "default",
  maintenance: "outline",
};

export function SlotManager({ zones: zonesProp, selectedZoneId, initialSlots: slotsProp }) {
  const router = useRouter();
  const zones = (zonesProp ?? []).filter((z) => z && z.$id);
  const initialSlots = (slotsProp ?? []).filter((s) => s && s.$id);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function goToZone(zoneId) {
    router.push(`/admin/slots?zoneId=${zoneId}`);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("zoneId", selectedZoneId);
    const result = await createSlotAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setAddOpen(false);
    router.refresh();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!editing?.$id) {
      setError("No slot selected for editing.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("slotId", editing.$id);
    const result = await updateSlotAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(slotId) {
    await deleteSlotAction(slotId);
    router.refresh();
  }

  async function handleToggleMaintenance(slot) {
    await toggleSlotMaintenanceAction(slot.$id, slot.status);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Zone</Label>
          <Select value={selectedZoneId} onValueChange={goToZone}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.$id} value={z.$id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedZoneId} onClick={() => setError(null)}>
              Add slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add slot</DialogTitle>
                <DialogDescription>Create a new slot in this zone.</DialogDescription>
              </DialogHeader>
              <SlotFields error={error} />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add slot"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {zones.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Create a zone first.
        </p>
      ) : initialSlots.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No slots in this zone yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSlots.map((s) => (
              <TableRow key={s.$id}>
                <TableCell className="font-medium">{s.slotCode}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{s.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[s.status] || "secondary"} className="capitalize">
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={s.status === "maintenance"}
                    onCheckedChange={() => handleToggleMaintenance(s)}
                  />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setEditing(s);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete slot?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove slot {s.slotCode}. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(s.$id)}>
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          {editing && (
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit slot</DialogTitle>
                <DialogDescription>Update slot details.</DialogDescription>
              </DialogHeader>
              <SlotFields slot={editing} error={error} />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
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

function SlotFields({ slot, error }) {
  const [type, setType] = useState(slot?.type || "general");
  const [status, setStatus] = useState(slot?.status || "available");

  return (
    <div className="flex flex-col gap-4 py-2">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="slotCode">Slot code</Label>
        <Input id="slotCode" name="slotCode" defaultValue={slot?.slotCode} placeholder="e.g. S015" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SLOT_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="type" value={type} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["available", "occupied", "reserved", "maintenance"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
      </div>
    </div>
  );
}
