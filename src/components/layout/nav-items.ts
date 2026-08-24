import { LayoutDashboard, ClipboardList, Map, History, UserCircle, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/types";

// Tambahkan tipe NavItem agar kita bisa membatasi menu berdasarkan Role
export interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: Role[]; // Jika tidak diisi, berarti semua role bisa melihatnya
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/work-orders", label: "Work Order", icon: ClipboardList },
  
  // Menu Baru Khusus Pegawai (Supervisor)
  { 
    href: "/dashboard/qa-inspeksi", 
    label: "QA & Inspeksi", 
    icon: ShieldCheck, 
    roles: ["supervisor"] 
  },
  
  { href: "/dashboard/peta", label: "Peta", icon: Map },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { href: "/dashboard/profil", label: "Profil", icon: UserCircle },
];