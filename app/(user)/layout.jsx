import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reserve", label: "Reserve" },
  { href: "/reservations", label: "My Reservations" },
  { href: "/parking-map", label: "Parking Map" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/profile", label: "Profile" },
];

export default async function UserLayout({ children }) {
  const current = await getCurrentUserWithProfile();
  if (!current) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold">Smart Campus Parking</span>
            <nav className="flex items-center gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {current.profile?.role === "admin" && (
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {current.profile?.name || current.user.name}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
