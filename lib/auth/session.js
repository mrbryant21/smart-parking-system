import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

export async function getLoggedInUser() {
  const session = await createSessionClient();
  if (!session) return null;

  try {
    return await session.account.get();
  } catch {
    return null;
  }
}

export async function getUserProfile(userId) {
  if (!userId) return null;
  const { databases } = createAdminClient();

  try {
    return await databases.getDocument(DB_ID, COLLECTIONS.USERS, userId);
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const user = await getLoggedInUser();
  if (!user) return null;

  const profile = await getUserProfile(user.$id);
  return { user, profile };
}

export async function requireUser() {
  const current = await getCurrentUserWithProfile();
  if (!current) throw new Error("UNAUTHENTICATED");
  return current;
}

export async function requireRole(...roles) {
  const current = await requireUser();
  if (!roles.includes(current.profile?.role)) {
    throw new Error("FORBIDDEN");
  }
  return current;
}
