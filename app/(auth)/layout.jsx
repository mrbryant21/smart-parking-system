import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
