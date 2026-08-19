"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { requireRole } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

const STATUSES = ["available", "occupied", "reserved", "maintenance"];

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function toPlainList(docs) {
  return toPlain(docs).filter((doc) => doc && doc.$id);
}

export async function listAllSlots() {
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [
    Query.orderAsc("slotCode"),
    Query.limit(500),
  ]);
  return toPlainList(result.documents);
}

export async function listSlotsByZone(zoneId) {
  if (!zoneId) return [];
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [
    Query.equal("zoneId", zoneId),
    Query.orderAsc("slotCode"),
    Query.limit(500),
  ]);
  return toPlainList(result.documents);
}

export async function getSlotCountsByZone() {
  const slots = await listAllSlots();
  return slots.reduce((acc, slot) => {
    acc[slot.zoneId] = (acc[slot.zoneId] || 0) + 1;
    return acc;
  }, {});
}

export async function createSlotAction(formData) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  const zoneId = formData.get("zoneId")?.toString();
  const slotCode = formData.get("slotCode")?.toString().trim().toUpperCase();
  const type = formData.get("type")?.toString() || "general";
  const status = formData.get("status")?.toString() || "available";

  if (!zoneId || !slotCode) return { error: "Zone and slot code are required." };
  if (!STATUSES.includes(status)) return { error: "Invalid status." };

  const { databases } = createAdminClient();

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.SLOTS, ID.unique(), {
      zoneId,
      slotCode,
      type,
      status,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not create slot." };
  }
}

export async function updateSlotAction(formData) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  const slotId = formData.get("slotId")?.toString();
  const slotCode = formData.get("slotCode")?.toString().trim().toUpperCase();
  const type = formData.get("type")?.toString() || "general";
  const status = formData.get("status")?.toString() || "available";

  if (!slotId || !slotCode) return { error: "Slot code is required." };
  if (!STATUSES.includes(status)) return { error: "Invalid status." };

  const { databases } = createAdminClient();

  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, slotId, {
      slotCode,
      type,
      status,
    });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update slot." };
  }
}

export async function toggleSlotMaintenanceAction(slotId, currentStatus) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }
  if (!slotId) return { error: "Missing slot." };

  const nextStatus = currentStatus === "maintenance" ? "available" : "maintenance";
  const { databases } = createAdminClient();

  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, slotId, { status: nextStatus });
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not update slot." };
  }
}

export async function deleteSlotAction(slotId) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }
  if (!slotId) return { error: "Missing slot." };

  const { databases } = createAdminClient();

  try {
    await databases.deleteDocument(DB_ID, COLLECTIONS.SLOTS, slotId);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not delete slot." };
  }
}
