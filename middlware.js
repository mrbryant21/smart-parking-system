import { NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/vehicles",
  "/reserve",
  "/reservations",
  "/profile",
];
const ADMIN_ONLY = ["/admin"];

export function middleware(req) {
  const session = req.cookies.get("appwrite-session");
  const { pathname } = req.nextUrl;

  if (
    !session &&
    [...PROTECTED, ...ADMIN_ONLY].some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/reserve/:path*",
    "/reservations/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
