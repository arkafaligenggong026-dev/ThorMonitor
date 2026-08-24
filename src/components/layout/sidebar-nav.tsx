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

export function SidebarNav({ nama, role }: { nama: string; role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white/80 md:backdrop-blur-xl">
      {/* Header Sidebar (Menggunakan Logo Horizontal) */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
        <Image
          src="/6594c76535ef0-pln.png"
          alt="Logo PLN"
          width={120}
          height={40}
          className="h-8 w-auto object-contain drop-shadow-sm"
          priority
        />
        <span className="text-lg font-extrabold tracking-tight text-slate-800">
          {APP_NAME}
        </span>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {NAV_ITEMS.map((item) => {
          
          // CEK ROLE: Jika menu punya batasan role (seperti menu QA), dan role user saat ini tidak ada di daftar tersebut, maka sembunyikan!
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
                  ? "bg-gradient-to-r from-[#0091B5]/10 to-transparent text-[#0091B5] shadow-sm ring-1 ring-[#0091B5]/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar (Profil & Logout) */}
      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 shadow-sm transition-colors hover:bg-slate-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0091B5] to-[#1E3A8A] text-sm font-bold text-white shadow-inner">
            {nama.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-700">{nama}</p>
            <p className="truncate text-xs font-semibold text-[#0091B5]">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}