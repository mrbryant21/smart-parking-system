import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "@/components/nav/MobileNav";

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

  const isAdmin = current.profile?.role === "admin";
  const mobileLinks = isAdmin ? [...NAV_LINKS, { href: "/admin", label: "Admin" }] : NAV_LINKS;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <MobileNav title="Smart Campus Parking" links={mobileLinks} />
            <span className="truncate text-sm font-semibold">Smart Campus Parking</span>
            <nav className="hidden items-center gap-4 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
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
