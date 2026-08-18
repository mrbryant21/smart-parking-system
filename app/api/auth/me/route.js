import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export async function GET() {
  const current = await getCurrentUserWithProfile();

  if (!current) {
    return NextResponse.json({ user: null, profile: null }, { status: 200 });
  }

  return NextResponse.json(current, { status: 200 });
}
