import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "@/components/nav/MobileNav";
import { USER_NAV_LINKS, ADMIN_QUICK_LINK } from "@/components/nav/userNavLinks";

export default async function UserLayout({ children }) {
  const current = await getCurrentUserWithProfile();
  if (!current) redirect("/login");

  const isAdmin = current.profile?.role === "admin";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <MobileNav title="Smart Campus Parking" showAdminLink={isAdmin} />
            <span className="truncate text-sm font-semibold">Smart Campus Parking</span>
            <nav className="hidden items-center gap-4 sm:flex">
              {USER_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href={ADMIN_QUICK_LINK.href}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ADMIN_QUICK_LINK.icon className="h-4 w-4" />
                  {ADMIN_QUICK_LINK.label}
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
