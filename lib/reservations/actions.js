"use server";

import { ID, Query } from "node-appwrite";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser, requireRole } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";
import { allocateSlot } from "@/lib/allocation/allocate";
import {
  sendReservationConfirmationEmail,
  sendReservationCancelledEmail,
  sendReservationExpiredEmail,
} from "@/lib/notifications/actions";

const RESERVATION_HOLD_MINUTES = 30;

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function toPlainList(list) {
  const docs = toPlain(list?.documents ?? []);
  return docs.filter((doc) => doc && doc.$id);
}

// Sweeps this user's own active reservations for anything past its expiry
// and frees the slot back up — a simple check-on-read expiry model.
async function expireStaleReservationsForUser(databases, userId) {
  const now = new Date().toISOString();

  const stale = await databases.listDocuments(DB_ID, COLLECTIONS.RESERVATIONS, [
    Query.equal("userId", userId),
    Query.equal("status", "active"),
    Query.lessThan("expiresAt", now),
    Query.limit(50),
  ]);

  for (const reservation of stale.documents) {
    await databases.updateDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservation.$id, {
      status: "expired",
    });
    try {
      const slot = await databases.getDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId);
      if (slot.status === "reserved") {
        await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId, {
          status: "available",
        });
      }
      await sendReservationExpiredEmail({ userId: reservation.userId, slotCode: slot.slotCode });
    } catch {
      // slot may have been deleted — nothing to free
    }
  }
}

export async function listMyReservations() {
  const user = await getLoggedInUser();
  if (!user) return [];

  const { databases } = createAdminClient();
  await expireStaleReservationsForUser(databases, user.$id);

  const result = await databases.listDocuments(DB_ID, COLLECTIONS.RESERVATIONS, [
    Query.equal("userId", user.$id),
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);

  return toPlainList(result);
}

export async function createReservationAction(formData) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };

  const destinationZoneId = formData.get("destinationZoneId")?.toString();
  const vehicleId = formData.get("vehicleId")?.toString();
  const role = formData.get("role")?.toString() || "student";

  if (!destinationZoneId || !vehicleId) {
    return { error: "Please select a destination and vehicle." };
  }

  const { databases } = createAdminClient();

  const existingActive = await databases.listDocuments(DB_ID, COLLECTIONS.RESERVATIONS, [
    Query.equal("userId", user.$id),
    Query.equal("status", "active"),
    Query.limit(1),
  ]);
  if (existingActive.total > 0) {
    return { error: "You already have an active reservation. Cancel it before making a new one." };
  }

  const [zonesResult, slotsResult] = await Promise.all([
    databases.listDocuments(DB_ID, COLLECTIONS.ZONES, [Query.limit(100)]),
    databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [Query.limit(500)]),
  ]);

  const allocation = allocateSlot({
    role,
    destinationZoneId,
    zones: zonesResult.documents,
    slots: slotsResult.documents,
  });

  if (!allocation) {
    return { error: "No available slots right now — please try again shortly." };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_HOLD_MINUTES * 60 * 1000);
  const qrCodeToken = randomUUID();

  try {
    const reservation = await databases.createDocument(
      DB_ID,
      COLLECTIONS.RESERVATIONS,
      ID.unique(),
      {
        userId: user.$id,
        vehicleId,
        slotId: allocation.slot.$id,
        status: "active",
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        qrCodeToken,
      }
    );

    await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, allocation.slot.$id, {
      status: "reserved",
    });

    await sendReservationConfirmationEmail({
      userId: user.$id,
      slotCode: allocation.slot.slotCode,
      zoneName: allocation.zone.name,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      success: true,
      reservation: toPlain(reservation),
      zone: toPlain(allocation.zone),
      slot: toPlain(allocation.slot),
      isFallback: allocation.isFallback,
    };
  } catch (err) {
    return { error: err?.message || "Could not create reservation." };
  }
}

export async function listAllReservationsAdmin() {
  try {
    await requireRole("admin");
  } catch {
    return [];
  }

  const { databases } = createAdminClient();
  const result = await databases.listDocuments(DB_ID, COLLECTIONS.RESERVATIONS, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);

  return toPlainList(result);
}

export async function verifyReservationToken(rawValue) {
  try {
    await requireRole("admin");
  } catch {
    return { error: "Not authorized." };
  }

  if (!rawValue || typeof rawValue !== "string") {
    return { error: "Empty QR code." };
  }

  const [reservationId, token] = rawValue.split(":");
  if (!reservationId || !token) {
    return { error: "Invalid QR code format." };
  }

  const { databases } = createAdminClient();

  let reservation;
  try {
    reservation = await databases.getDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservationId);
  } catch {
    return { error: "Reservation not found." };
  }

  if (reservation.qrCodeToken !== token) {
    return { error: "QR code does not match this reservation." };
  }

  if (new Date(reservation.expiresAt) < new Date() && reservation.status === "active") {
    await databases.updateDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservationId, {
      status: "expired",
    });
    return { error: "Reservation has expired." };
  }

  if (reservation.status !== "active") {
    return { error: `Reservation is ${reservation.status}, not active.` };
  }

  let slot;
  let zone = null;
  try {
    slot = await databases.getDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId);
    zone = await databases.getDocument(DB_ID, COLLECTIONS.ZONES, slot.zoneId);
  } catch {
    return { error: "Slot or zone data is missing for this reservation." };
  }

  let userName = "Unknown";
  try {
    const userDoc = await databases.getDocument(DB_ID, COLLECTIONS.USERS, reservation.userId);
    userName = userDoc.name || userName;
  } catch {
    // profile may be missing — proceed anyway
  }

  await databases.updateDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservationId, {
    status: "completed",
  });
  await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId, {
    status: "occupied",
  });

  return {
    success: true,
    reservation: toPlain(reservation),
    slot: toPlain(slot),
    zone: toPlain(zone),
    userName,
  };
}

export async function cancelReservationAction(reservationId) {
  const user = await getLoggedInUser();
  if (!user) return { error: "Not authenticated." };
  if (!reservationId) return { error: "Missing reservation." };

  const { databases } = createAdminClient();

  try {
    const reservation = await databases.getDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservationId);
    if (reservation.userId !== user.$id) return { error: "Not authorized." };
    if (reservation.status !== "active") return { error: "Reservation is not active." };

    await databases.updateDocument(DB_ID, COLLECTIONS.RESERVATIONS, reservationId, {
      status: "cancelled",
    });

    const slot = await databases.getDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId);
    if (slot.status === "reserved") {
      await databases.updateDocument(DB_ID, COLLECTIONS.SLOTS, reservation.slotId, {
        status: "available",
      });
    }

    await sendReservationCancelledEmail({ userId: user.$id, slotCode: slot.slotCode });

    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not cancel reservation." };
  }
}
