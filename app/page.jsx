import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const current = await getCurrentUserWithProfile();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Smart Campus Parking Management System
        </h1>
        <p className="text-muted-foreground text-center">
          Find, reserve, and manage campus parking — <br/> allocated intelligently by
          destination, role, and live occupancy.
        </p>
      </div>
      <div className="flex gap-3">
        {current ? (
          <Button asChild>
            <Link href={current.profile?.role === "admin" ? "/admin" : "/dashboard"}>
              Go to dashboard
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
