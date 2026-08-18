"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createZoneAction, updateZoneAction, deleteZoneAction } from "@/lib/zones/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function ZoneManager({ initialZones, slotCounts }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createZoneAction(new FormData(e.currentTarget));

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

    const formData = new FormData(e.currentTarget);
    formData.set("zoneId", editing.$id);
    const result = await updateZoneAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(zoneId) {
    setDeleteError(null);
    const result = await deleteZoneAction(zoneId);
    if (result?.error) {
      setDeleteError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setError(null)}>Add zone</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add zone</DialogTitle>
                <DialogDescription>Create a new parking zone.</DialogDescription>
              </DialogHeader>
              <ZoneFields error={error} />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add zone"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {deleteError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p>
      )}

      {initialZones.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No zones yet. Add one to get started.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Near</TableHead>
              <TableHead>Slots</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialZones.map((z) => (
              <TableRow key={z.$id}>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{z.nearDepartment || "—"}</TableCell>
                <TableCell>{slotCounts[z.$id] || 0}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/slots?zoneId=${z.$id}`}>Manage slots</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setEditing(z);
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
                        <AlertDialogTitle>Delete zone?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {z.name}. Zones with slots can&apos;t be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(z.$id)}>
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
                <DialogTitle>Edit zone</DialogTitle>
                <DialogDescription>Update zone details.</DialogDescription>
              </DialogHeader>
              <ZoneFields zone={editing} error={error} />
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

function ZoneFields({ zone, error }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Zone name</Label>
        <Input id="name" name="name" defaultValue={zone?.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nearDepartment">Near department / landmark</Label>
        <Input id="nearDepartment" name="nearDepartment" defaultValue={zone?.nearDepartment} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="totalSlots">Target capacity</Label>
        <Input id="totalSlots" name="totalSlots" type="number" min="0" defaultValue={zone?.totalSlots ?? 0} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={zone?.description} rows={3} />
      </div>
    </div>
  );
}
