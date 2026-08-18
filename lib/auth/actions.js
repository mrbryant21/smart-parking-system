"use server";

import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { createAdminClient, SESSION_COOKIE } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/appwrite/collection";

const ROLES = ["student", "lecturer", "staff", "visitor"];

async function setSessionCookie(secret) {
  (await cookies()).set(SESSION_COOKIE, secret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
  });
}

export async function registerAction(formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  const department = formData.get("department")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";

  if (!name || !email || !password) {
    return { error: "Name, email and password are required." };
  }
  if (!ROLES.includes(role)) {
    return { error: "Please select a valid role." };
  }

  const { account, databases } = createAdminClient();

  let userId;
  try {
    const user = await account.create(ID.unique(), email, password, name);
    userId = user.$id;
  } catch (err) {
    return { error: err?.message || "Could not create account." };
  }

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.USERS, userId, {
      userId,
      name,
      email,
      role,
      department,
      phone,
    });
  } catch (err) {
    return { error: err?.message || "Account created but profile setup failed." };
  }

  try {
    const session = await account.createEmailPasswordSession(email, password);
    await setSessionCookie(session.secret);
  } catch (err) {
    return { error: err?.message || "Account created — please log in." };
  }

  return { success: true };
}

export async function loginAction(formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { account } = createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(email, password);
    await setSessionCookie(session.secret);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Invalid credentials." };
  }
}

export async function logoutAction() {
  const jar = await cookies();
  const sessionCookie = jar.get(SESSION_COOKIE);

  if (sessionCookie?.value) {
    try {
      const { Client, Account } = await import("node-appwrite");
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setSession(sessionCookie.value);
      await new Account(client).deleteSession("current");
    } catch {
      // session already invalid — fall through to cookie clear
    }
  }

  jar.delete(SESSION_COOKIE);
  return { success: true };
}

export async function requestPasswordResetAction(formData) {
  const email = formData.get("email")?.toString().trim();
  if (!email) return { error: "Email is required." };

  const { account } = createAdminClient();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password/confirm`;

  try {
    await account.createRecovery(email, resetUrl);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not send reset email." };
  }
}

export async function confirmPasswordResetAction(formData) {
  const userId = formData.get("userId")?.toString();
  const secret = formData.get("secret")?.toString();
  const password = formData.get("password")?.toString();

  if (!userId || !secret || !password) {
    return { error: "Invalid or expired reset link." };
  }

  const { account } = createAdminClient();

  try {
    await account.updateRecovery(userId, secret, password);
    return { success: true };
  } catch (err) {
    return { error: err?.message || "Could not reset password." };
  }
}
