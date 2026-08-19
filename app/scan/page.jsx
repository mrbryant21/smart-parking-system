import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { ScanClient } from "./ScanClient";

export default async function ScanPage() {
  const current = await getCurrentUserWithProfile();
  if (!current) redirect("/login");
  if (current.profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Scan Reservation QR</h1>
        <p className="text-muted-foreground">
          Point the camera at a reservation QR code to verify entry.
        </p>
      </div>
      <ScanClient />
    </div>
  );
}
