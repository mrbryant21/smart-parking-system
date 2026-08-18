"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/lib/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function ProfileForm({ user, profile }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {saved && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">Profile updated.</p>
      )}

      <div className="flex flex-col gap-2">
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Role</Label>
        <div>
          <Badge variant="secondary" className="capitalize">
            {profile?.role || "unknown"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={profile?.name || user.name} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" defaultValue={profile?.department || ""} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} />
      </div>

      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
