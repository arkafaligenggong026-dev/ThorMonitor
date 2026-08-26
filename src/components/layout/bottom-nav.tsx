"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav 
      // PERBAIKAN: Border diubah jadi gelap (slate-800), bayangan lebih pekat agar terpisah dari konten halaman
      className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around rounded-t-3xl border-t border-slate-700/80 px-2 pb-2 pt-1 shadow-[0_-15px_40px_-10px_rgba(0,0,0,0.5)] md:hidden overflow-hidden"
      style={{
        // Menggunakan Batik Gelap persis seperti Sidebar
        backgroundImage: "url('/bg-batik-dark.png')",
        backgroundSize: "450px", // Ukuran disesuaikan agar motif terlihat pas di HP
        backgroundPosition: "center bottom",
        backgroundRepeat: "repeat",
        // Overlay biru dongker/navy gelap (Slate 950)
        backgroundColor: "rgba(15, 23, 42, 0.96)", 
      }}
    >
      {/* Efek Cahaya ambient dari bawah agar tidak terlalu mati */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0091B5]/20 to-transparent pointer-events-none" />

      {NAV_ITEMS.map((item) => {
        // Mencegah menu bocor ke role yang tidak berhak
        if (item.roles && !item.roles.includes(role)) return null;

        const active = item.href === "/dashboard" 
          ? pathname === item.href 
          : pathname.startsWith(item.href);
        
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 w-full h-full z-10"
          >
            {/* INDIKATOR: Kapsul aktif sekarang menggunakan Kuning PLN agar menyala di background gelap */}
            <div className={cn(
              "flex items-center justify-center transition-all duration-500",
              active 
                ? "w-14 h-8 rounded-full bg-[#F8D90F]/15 text-[#F8D90F] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),_0_0_10px_rgba(248,217,15,0.2)]" 
                : "w-10 h-8 bg-transparent text-slate-400"
            )}>
              <Icon className={cn(
                "transition-all duration-300", 
                active ? "h-5 w-5 scale-110 drop-shadow-[0_0_6px_rgba(248,217,15,0.6)]" : "h-[22px] w-[22px]"
              )} />
            </div>
            
            {/* Teks Label di Bawah Kapsul juga menggunakan warna Kuning */}
            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-all duration-300 text-center line-clamp-1 drop-shadow-md",
              active 
                ? "text-[#F8D90F] opacity-100 translate-y-0" 
                : "text-slate-400 opacity-0 absolute translate-y-4 pointer-events-none scale-75"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}