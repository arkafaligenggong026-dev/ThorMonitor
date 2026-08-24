import { LayoutDashboard, ClipboardList, Map, History, UserCircle } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/work-orders", label: "Work Order", icon: ClipboardList },
  { href: "/dashboard/peta", label: "Peta", icon: Map },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { href: "/dashboard/profil", label: "Profil", icon: UserCircle },
] as const;
