"use client";

import { Zap, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { APP_NAME } from "@/lib/constants";

export function Topbar({ nama }: { nama: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Zap className="h-4 w-4" fill="currentColor" />
        </div>
        <span className="text-base font-bold text-ink">{APP_NAME}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Hai, {nama.split(" ")[0]}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
