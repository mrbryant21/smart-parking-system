"use server";

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser, requireRole } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

const ROLES = ["student", "lecturer", "staff", "visitor", "admin"];

function toPlainList(docs) {
  return JSON.parse(JSON.stringify(docs ?? [])).filter((d) => d && d.$id);
}

export async function listAllUsersAdmin() {
  try {
    await requireRole("admin");
  } catch {
    return [];
  }

  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.USERS, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);

  return toPlainList(result.documents);
}

export async function updateUserRoleAction(targetUserId, role) {
  const current = await getLoggedInUser();
  if (!current) return { error: "Not authenticated." };

  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  if (!targetUserId || !ROLES.includes(role)) {
    return { error: "Invalid role." };
  }

  if (targetUserId === current.$id && role !== "admin") {
    return { error: "You can't remove your own admin access." };
  }

  const { databases } = createAdminClient();

  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.USERS, targetUserId, { role });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update role." };
  }
}

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
