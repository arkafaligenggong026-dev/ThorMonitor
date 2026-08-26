"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { APP_NAME, ROLE_LABEL } from "@/lib/constants";
import type { Role } from "@/lib/types";

// PERBAIKAN: Menambahkan props 'ulp'
export function SidebarNav({ nama, role, ulp }: { nama: string; role: Role; ulp?: string | null }) {
  const pathname = usePathname();

  // Gabungkan Nama Role dan ULP (Contoh: "Pegawai (Kantor) - ULP Manado Selatan")
  const roleDanKantor = ulp ? `${ROLE_LABEL[role]} - ${ulp}` : ROLE_LABEL[role];

  return (
    <aside 
      className="hidden md:flex md:w-64 md:flex-col md:border-r border-slate-800 shadow-2xl relative overflow-hidden sticky top-0 h-screen"
      style={{
        backgroundImage: "url('/bg-batik-dark.png')",
        backgroundSize: "1200px",
        backgroundPosition: "center top",
        backgroundRepeat: "repeat-y",
        backgroundColor: "rgba(15, 23, 42, 0.95)", 
      }}
    >
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#0091B5] opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex h-16 items-center gap-3 border-b border-white/10 px-6 bg-slate-900/40 shrink-0">
        <Image
          src="/6594c76535ef0-pln.png"
          alt="Logo PLN"
          width={120}
          height={40}
          className="h-12 w-auto object-contain drop-shadow-md brightness-110" 
          priority
        />
        <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
          {APP_NAME}
        </span>
      </div>

      <nav className="relative z-10 flex-1 space-y-1.5 px-3 py-6 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null;

          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-gradient-to-r from-[#F8D90F]/15 to-transparent text-[#F8D90F] shadow-sm ring-1 ring-[#F8D90F]/30"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 border-t border-white/10 p-4 bg-slate-900/40 shrink-0">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 shadow-sm transition-colors hover:bg-white/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0091B5] to-[#1E3A8A] text-sm font-bold text-white shadow-inner">
            {nama.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{nama}</p>
            {/* PERBAIKAN: Teks mengecil sedikit agar muat nama ULP yang panjang */}
            <p className="truncate text-[11px] font-semibold text-[#FE8200] drop-shadow-md">{roleDanKantor}</p>
          </div>
        </div>
        
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}