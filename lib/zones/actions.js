"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { requireRole } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function listZones() {
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.ZONES, [
    Query.orderAsc("name"),
    Query.limit(100),
  ]);
  const docs = toPlain(result.documents);
  return docs.filter((doc) => doc && doc.$id);
}

export async function createZoneAction(formData) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const nearDepartment = formData.get("nearDepartment")?.toString().trim() || "";
  const totalSlots = Number(formData.get("totalSlots") || 0);

  if (!name) return { error: "Zone name is required." };

  const { databases } = createAdminClient();

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.ZONES, ID.unique(), {
      name,
      description,
      nearDepartment,
      totalSlots,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not create zone." };
  }
}

export async function updateZoneAction(formData) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  const zoneId = formData.get("zoneId")?.toString();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const nearDepartment = formData.get("nearDepartment")?.toString().trim() || "";
  const totalSlots = Number(formData.get("totalSlots") || 0);

  if (!zoneId || !name) return { error: "Zone name is required." };

  const { databases } = createAdminClient();

  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.ZONES, zoneId, {
      name,
      description,
      nearDepartment,
      totalSlots,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update zone." };
  }
}

export async function deleteZoneAction(zoneId) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }
  if (!zoneId) return { error: "Missing zone." };

  const { databases } = createAdminClient();

  try {
    const slots = await databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [
      Query.equal("zoneId", zoneId),
      Query.limit(1),
    ]);
    if (slots.total > 0) {
      return { error: "Delete or reassign this zone's slots first." };
    }

    await databases.deleteDocument(DB_ID, COLLECTIONS.ZONES, zoneId);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not delete zone." };
  }
}
