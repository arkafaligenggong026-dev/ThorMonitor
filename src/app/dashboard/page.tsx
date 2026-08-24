import Link from "next/link";
import { Plus, ArrowRight, ClipboardList } from "lucide-react";
import { getWorkOrders, getCurrentUserAndProfile, hitungStats } from "@/lib/data";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WoCard } from "@/components/work-order/wo-card";
import { Button } from "@/components/ui/button";
import type { WorkOrder } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [{ profile }, workOrders] = await Promise.all([
    getCurrentUserAndProfile(),
    getWorkOrders(),
  ]);
  const stats = hitungStats(workOrders);
  const terbaru = workOrders.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Halo,{" "}
            <span className="bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] bg-clip-text text-transparent">
              {profile?.nama_lengkap.split(" ")[0]}
            </span>
            <span className="text-2xl sm:text-3xl"> 👋</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
            Ringkasan Work Order gangguan jaringan distribusi.
          </p>
        </div>
        
        {profile?.role === "tim_inspeksi" && (
          <Link href="/dashboard/work-orders/baru" className="hidden sm:block">
            <Button className="border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-[#0091B5]/40">
              <Plus className="mr-2 h-5 w-5" />
              Buat Laporan
            </Button>
          </Link>
        )}
      </div>

      {/* Kartu Statistik */}
      <div className="relative">
        <div className="absolute -inset-4 z-0 rounded-3xl bg-gradient-to-br from-[#0091B5]/5 to-transparent blur-xl" />
        <div className="relative z-10">
          <StatsCards stats={stats} />
        </div>
      </div>

      {/* Daftar Laporan Terbaru */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Laporan Terbaru</h2>
          <Link
            href="/dashboard/work-orders"
            className="group flex items-center text-sm font-bold text-[#0091B5] transition-colors hover:text-[#1E3A8A]"
          >
            Lihat Semua
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <DaftarWo items={terbaru} />
      </div>

      {/* Tombol Melayang (FAB) khusus Mobile */}
      {profile?.role === "tim_inspeksi" && (
        <Link
          href="/dashboard/work-orders/baru"
          className="fixed bottom-20 right-4 z-40 sm:hidden"
        >
          <Button size="icon" className="h-14 w-14 rounded-full border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] text-white shadow-xl transition-transform active:scale-95">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function DaftarWo({ items }: { items: WorkOrder[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center transition-colors hover:border-[#0091B5]/30 hover:bg-[#0091B5]/5">
        <div className="mb-4 rounded-full bg-white p-4 text-[#0091B5] shadow-sm">
          <ClipboardList className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold text-slate-700">Belum ada laporan Work Order</p>
        <p className="mt-1 text-sm text-slate-500">Pekerjaan yang ditugaskan akan muncul di sini.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((wo) => (
        <div key={wo.id} className="transition-all hover:-translate-y-1 hover:drop-shadow-sm">
          <WoCard wo={wo} />
        </div>
      ))}
    </div>
  );
}