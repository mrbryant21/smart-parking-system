import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminMobileSidebar } from "@/components/admin/AdminMobileSidebar";

export default async function AdminLayout({ children }) {
  const current = await getCurrentUserWithProfile();
  if (!current) redirect("/login");
  if (current.profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 bg-neutral-900 p-4 text-white lg:flex">
        <div className="px-2 pt-2">
          <span className="text-sm font-semibold">Smart Campus Parking</span>
          <p className="text-xs text-white/50">Admin</p>
        </div>
        <AdminSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b bg-background">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 lg:hidden">
              <AdminMobileSidebar />
              <span className="text-sm font-semibold">Admin</span>
            </div>
            <div className="hidden lg:block" />
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
    </div>
  );
}
