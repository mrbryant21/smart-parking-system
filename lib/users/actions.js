"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

export async function updateProfileAction(formData) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };

  const name = formData.get("name")?.toString().trim();
  const department = formData.get("department")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";

  if (!name) return { error: "Name is required." };

  const { databases } = createAdminClient();

  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.USERS, user.$id, {
      name,
      department,
      phone,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update profile." };
  }
}
