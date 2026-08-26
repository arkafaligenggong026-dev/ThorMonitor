import { LayoutDashboard, ClipboardList, Map, History, UserCircle, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/work-orders", label: "Work Order", icon: ClipboardList },
  
  // DIBUKA UNTUK: supervisor (buat laporan/validasi) dan tim_rabas (tindak lanjut eksekusi)
  { 
    href: "/dashboard/qa-inspeksi", 
    label: "QA & Inspeksi Management", 
    icon: ShieldCheck, 
    roles: ["supervisor", "tim_rabas"] 
  },
  
  { href: "/dashboard/peta", label: "Peta", icon: Map },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { href: "/dashboard/profil", label: "Profil", icon: UserCircle },
];