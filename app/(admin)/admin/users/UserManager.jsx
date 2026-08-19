"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/lib/users/actions";
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

const ROLES = ["student", "lecturer", "staff", "visitor", "admin"];

export function UserManager({ initialUsers }) {
  const router = useRouter();
  const users = (initialUsers ?? []).filter((u) => u && u.$id);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  async function handleRoleChange(userId, role) {
    setError(null);
    setPendingId(userId);

    const result = await updateUserRoleAction(userId, role);

    setPendingId(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No registered users yet.
      </p>
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.$id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>{u.department || "—"}</TableCell>
              <TableCell>
                <Select
                  value={u.role}
                  onValueChange={(role) => handleRoleChange(u.$id, role)}
                  disabled={pendingId === u.$id}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
