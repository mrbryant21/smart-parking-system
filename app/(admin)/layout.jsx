import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/zones", label: "Zones" },
  { href: "/admin/slots", label: "Slots" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({ children }) {
  const current = await getCurrentUserWithProfile();
  if (!current) redirect("/login");
  if (current.profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold">Admin · Smart Campus Parking</span>
            <nav className="flex flex-wrap items-center gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {current.profile?.name || current.user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
