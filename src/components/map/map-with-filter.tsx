"use client";

import { useState } from "react";
import { LeafletMap } from "@/components/map/leaflet-map";

// 🔥 TAMBAHAN: popupHtml dimasukkan agar TypeScript tidak error
interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  color: string;
  status: string; 
  popupHtml?: string; 
}

const FILTER_TABS = [
  { value: "all", label: "Semua Laporan" },
  { value: "open", label: "Menunggu" },
  { value: "assigned", label: "Ditugaskan" },
  { value: "in_progress", label: "Dikerjakan" },
  { value: "resolved", label: "Verifikasi" },
  { value: "closed", label: "Selesai" },
];

export function MapWithFilter({ initialMarkers }: { initialMarkers: MarkerData[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Logika Filter
  const filteredMarkers = initialMarkers.filter((marker) => {
    if (statusFilter === "all") return true;
    return marker.status === statusFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* KOTAK TOMBOL FILTER (Tabs/Pills) */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-700 text-sm">Filter Status Pekerjaan:</p>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Total: <span className="text-[#0091B5] font-bold">{filteredMarkers.length}</span> Titik
          </div>
        </div>

        {/* Deretan Tombol */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#0091B5] text-white shadow-md scale-105"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER PETA */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <LeafletMap 
          markers={filteredMarkers} 
          height="min(60vh, 520px)" 
        />
      </div>
      
    </div>
  );
}