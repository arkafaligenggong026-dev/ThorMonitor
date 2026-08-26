"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil tanggal dari URL jika ada
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (from) params.set("from", from);
    else params.delete("from");
    
    if (to) params.set("to", to);
    else params.delete("to");
    
    // Refresh halaman dengan parameter tanggal baru
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    router.push("?");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      
      {/* Header Filter (Ikon & Judul) */}
      <div className="flex items-center gap-2 text-[#0091B5] sm:mr-2 sm:mb-1">
        <Calendar className="h-5 w-5" />
        <span className="text-sm font-bold">Filter Waktu:</span>
      </div>

      {/* Grid Input Tanggal (Menyamping di Laptop, Menumpuk 2 Kolom di HP) */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-3 flex-1">
        <div className="w-full">
          <label className="mb-1 block text-xs font-bold text-slate-500 truncate">
            Mulai Tanggal
          </label>
          <input 
            type="date" 
            value={from} 
            onChange={(e) => setFrom(e.target.value)} 
            className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 transition-colors focus:border-[#0091B5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0091B5]" 
          />
        </div>

        <div className="w-full">
          <label className="mb-1 block text-xs font-bold text-slate-500 truncate">
            Sampai (Opsional)
          </label>
          <input 
            type="date" 
            value={to} 
            min={from}
            onChange={(e) => setTo(e.target.value)} 
            className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 transition-colors focus:border-[#0091B5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0091B5]" 
          />
        </div>
      </div>

      {/* Tombol Aksi (Penuh di HP, Menyesuaikan di Laptop) */}
      <div className="flex w-full sm:w-auto gap-2 pt-1 sm:pt-0">
        <Button 
          onClick={handleApply} 
          className="h-10 flex-1 sm:flex-none bg-[#0091B5] hover:bg-[#007A99] text-white font-bold shadow-sm rounded-lg transition-transform active:scale-95"
        >
          <Filter className="mr-2 h-4 w-4" />
          Terapkan
        </Button>
        
        {(from || to) && (
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="h-10 px-3 sm:px-4 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-transform active:scale-95"
            aria-label="Reset Filter"
          >
            <X className="h-5 w-5 sm:mr-1 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}