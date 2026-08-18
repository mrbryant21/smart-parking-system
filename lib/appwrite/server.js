import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "appwrite-session";

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    return {
        account: new Account(client),
        databases: new Databases(client),
        users: new Users(client)
    };
}

export async function createSessionClient() {
    const sessionCookie = (await cookies()).get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
        return null;
    }

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setSession(sessionCookie.value);

    return {
        account: new Account(client),
        databases: new Databases(client),
    };
}