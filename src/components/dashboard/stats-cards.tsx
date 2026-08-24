import { ClipboardList, Clock, Wrench, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Total Laporan",
      value: stats.total,
      icon: ClipboardList,
      gradient: "from-[#0091B5] to-[#1E3A8A]", // Cyan ke Biru Tua PLN
      shadow: "shadow-[#0091B5]/30",
    },
    {
      label: "Menunggu Eksekusi",
      value: stats.open + stats.assigned,
      icon: Clock,
      gradient: "from-[#F8D90F] to-[#FE8200]", // Kuning ke Oranye PLN
      shadow: "shadow-[#FE8200]/30",
    },
    {
      label: "Sedang Dikerjakan",
      value: stats.in_progress,
      icon: Wrench,
      gradient: "from-[#FE8200] to-[#CE0900]", // Oranye ke Merah PLN
      shadow: "shadow-[#CE0900]/30",
    },
    {
      label: "Selesai",
      value: stats.resolved + stats.closed,
      icon: CheckCircle2,
      // Untuk "Selesai", kita tetap gunakan warna Hijau Emerald agar UX-nya jelas (melambangkan sukses)
      gradient: "from-[#10b981] to-[#047857]", 
      shadow: "shadow-emerald-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card 
            key={item.label} 
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
          >
            {/* Hiasan blur di pojok kanan atas kartu */}
            <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition-transform group-hover:scale-150 blur-2xl", item.gradient)} />
            
            <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110", item.gradient, item.shadow)}>
              <Icon className="h-6 w-6" />
            </div>
            
            <div className="relative z-10">
              <p className="text-3xl font-extrabold text-slate-800">{item.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{item.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}