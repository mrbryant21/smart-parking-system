import {
  LayoutDashboard,
  CalendarPlus,
  ClipboardList,
  MapPin,
  Car,
  User2,
  ShieldCheck,
} from "lucide-react";

export const USER_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reserve", label: "Reserve", icon: CalendarPlus },
  { href: "/reservations", label: "My Reservations", icon: ClipboardList },
  { href: "/parking-map", label: "Parking Map", icon: MapPin },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/profile", label: "Profile", icon: User2 },
];

export const ADMIN_QUICK_LINK = { href: "/admin", label: "Admin", icon: ShieldCheck };
