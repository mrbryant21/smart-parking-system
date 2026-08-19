"use server";

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { requireRole } from "@/lib/auth/session";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

function dayKey(dateString) {
  return new Date(dateString).toISOString().slice(0, 10);
}

export async function getReportsData() {
  try {
    await requireRole("admin");
  } catch {
    return null;
  }

  const { databases } = createAdminClient();

  const [usersResult, slotsResult, zonesResult, reservationsResult] = await Promise.all([
    databases.listDocuments(DB_ID, COLLECTIONS.USERS, [Query.limit(1000)]),
    databases.listDocuments(DB_ID, COLLECTIONS.SLOTS, [Query.limit(1000)]),
    databases.listDocuments(DB_ID, COLLECTIONS.ZONES, [Query.limit(200)]),
    databases.listDocuments(DB_ID, COLLECTIONS.RESERVATIONS, [
      Query.orderDesc("$createdAt"),
      Query.limit(1000),
    ]),
  ]);

  const users = usersResult.documents;
  const slots = slotsResult.documents;
  const zones = zonesResult.documents;
  const reservations = reservationsResult.documents;

  // Users by role
  const usersByRole = {};
  for (const u of users) {
    usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
  }

  // Occupancy by slot status
  const occupancyByStatus = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
  for (const s of slots) {
    if (occupancyByStatus[s.status] !== undefined) occupancyByStatus[s.status] += 1;
  }

  // Most-used zone — by reservation count
  const zoneNameById = Object.fromEntries(zones.map((z) => [z.$id, z.name]));
  const slotZoneById = Object.fromEntries(slots.map((s) => [s.$id, s.zoneId]));
  const reservationsByZone = {};
  for (const r of reservations) {
    const zoneId = slotZoneById[r.slotId];
    const zoneName = zoneNameById[zoneId] || "Unknown";
    reservationsByZone[zoneName] = (reservationsByZone[zoneName] || 0) + 1;
  }

  // Daily reservations — last 7 days
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const countsByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const r of reservations) {
    const key = dayKey(r.$createdAt);
    if (key in countsByDay) countsByDay[key] += 1;
  }

  return {
    totalUsers: users.length,
    usersByRole: Object.entries(usersByRole).map(([role, count]) => ({ role, count })),
    totalSlots: slots.length,
    occupancy: Object.entries(occupancyByStatus).map(([status, count]) => ({ status, count })),
    mostUsedZones: Object.entries(reservationsByZone)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    dailyReservations: days.map((d) => ({
      day: d.slice(5),
      count: countsByDay[d],
    })),
    totalReservations: reservations.length,
  };
}
