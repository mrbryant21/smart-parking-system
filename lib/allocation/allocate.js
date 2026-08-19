const ROLE_ALLOWED_TYPES = {
  student: ["general"],
  lecturer: ["general", "staff"],
  staff: ["general", "staff"],
  visitor: ["general", "visitor"],
  admin: ["general", "staff", "visitor"],
};

export function allowedSlotTypesForRole(role) {
  return ROLE_ALLOWED_TYPES[role] || ["general"];
}

/**
 * Rule-based smart allocation:
 * 1. Try the destination zone first (closest to where the user is headed).
 * 2. If it has no available slot matching the user's role, fall back to the
 *    next zone in the list (occupancy balancing) — repeating until one is found.
 *
 * @param {object} params
 * @param {string} params.role
 * @param {string} params.destinationZoneId
 * @param {Array} params.zones - all zones
 * @param {Array} params.slots - all slots (any zone), each with { $id, zoneId, status, type }
 * @returns {{ zone: object, slot: object, isFallback: boolean } | null}
 */
export function allocateSlot({ role, destinationZoneId, zones, slots }) {
  const allowedTypes = allowedSlotTypesForRole(role);

  const destinationZone = zones.find((z) => z.$id === destinationZoneId);
  if (!destinationZone) return null;

  const orderedZones = [
    destinationZone,
    ...zones.filter((z) => z.$id !== destinationZoneId),
  ];

  for (const zone of orderedZones) {
    const candidate = slots.find(
      (s) =>
        s.zoneId === zone.$id &&
        s.status === "available" &&
        allowedTypes.includes(s.type)
    );

    if (candidate) {
      return {
        zone,
        slot: candidate,
        isFallback: zone.$id !== destinationZoneId,
      };
    }
  }

  return null;
}
