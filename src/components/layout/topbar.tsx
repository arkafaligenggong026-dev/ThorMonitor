"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { APP_NAME } from "@/lib/constants";

export function Topbar({ nama }: { nama: string }) {
  // Prop 'nama' sengaja tidak kita pakai di UI agar tidak dobel dengan banner halaman
  
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/90 bg-slate-950/95 px-4 backdrop-blur-lg md:hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]">
      
      {/* Logo PLN & Nama Aplikasi */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/6594c76535ef0-pln.png"  
          alt="Logo PLN"
          width={100}
          height={32}
          className="h-12 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] brightness-110"
          priority
        />
        <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-md">
          {APP_NAME}
        </span>
      </div>

      {/* Tombol Logout Keren */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="group flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 ring-1 ring-inset ring-red-500/20 transition-all active:scale-95 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        >
          <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Keluar</span>
        </button>
      </form>
    </header>
  );
}