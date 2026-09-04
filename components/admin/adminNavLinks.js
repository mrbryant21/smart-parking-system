import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  LayoutGrid,
  ClipboardList,
  BarChart3,
  QrCode,
} from "lucide-react";

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/zones", label: "Zones", icon: MapPin },
  { href: "/admin/slots", label: "Slots", icon: LayoutGrid },
  { href: "/admin/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/scan", label: "Scan QR", icon: QrCode },
];
