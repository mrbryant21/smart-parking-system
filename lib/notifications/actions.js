"use server";

import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

async function logEmail(databases, { userId, type, status }) {
  try {
    await databases.createDocument(DB_ID, COLLECTIONS.EMAIL_LOGS, ID.unique(), {
      userId,
      type,
      sentAt: new Date().toISOString(),
      status,
    });
  } catch {
    // logging is best-effort — never block the caller on this
  }
}

// Sends a notification email via Appwrite Messaging. Requires an email
// provider to be configured in Appwrite Console → Messaging → Providers.
// Failures are logged but never thrown — notifications must not break
// the reservation flow they're attached to.
async function sendEmail({ userId, subject, content, type }) {
  const { databases, messaging } = createAdminClient();

  try {
    await messaging.createEmail(
      ID.unique(),
      subject,
      content,
      [],
      [userId]
    );
    await logEmail(databases, { userId, type, status: "sent" });
    return { success: true };
  } catch (err) {
    await logEmail(databases, { userId, type, status: "failed" });
    return { error: err?.message || "Could not send email." };
  }
}

export async function sendReservationConfirmationEmail({ userId, slotCode, zoneName, expiresAt }) {
  return sendEmail({
    userId,
    type: "reservation_confirmation",
    subject: "Parking reservation confirmed",
    content: `Your parking slot ${slotCode} in ${zoneName} is reserved until ${new Date(expiresAt).toLocaleString()}. Show your QR code at the entrance.`,
  });
}

export async function sendReservationCancelledEmail({ userId, slotCode }) {
  return sendEmail({
    userId,
    type: "reservation_cancelled",
    subject: "Parking reservation cancelled",
    content: `Your reservation for slot ${slotCode} has been cancelled.`,
  });
}

export async function sendReservationExpiredEmail({ userId, slotCode }) {
  return sendEmail({
    userId,
    type: "reservation_expired",
    subject: "Parking reservation expired",
    content: `Your reservation for slot ${slotCode} has expired and the slot was released.`,
  });
}
