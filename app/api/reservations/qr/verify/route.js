import { NextResponse } from "next/server";
import { verifyReservationToken } from "@/lib/reservations/actions";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const result = await verifyReservationToken(body?.value);

  if (result?.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 200 });
}
