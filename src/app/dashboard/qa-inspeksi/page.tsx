import Link from "next/link";
import { Plus, ShieldCheck, ClipboardList } from "lucide-react";
import { getWorkOrders, getCurrentUserAndProfile } from "@/lib/data";
import { WoCard } from "@/components/work-order/wo-card";
import { Button } from "@/components/ui/button";
import { ExportQaButton } from "@/components/qa-inspeksi/export-qa-button";

export const metadata = { title: "QA & Inspeksi ROW" };

export default async function QaInspeksiPage() {
  const [{ profile }, workOrders] = await Promise.all([
    getCurrentUserAndProfile(),
    getWorkOrders(),
  ]);

  // Filter khusus untuk menampilkan QA (Kategori ROW dan punya data minggu_ke)
  const qaOrders = workOrders.filter(wo => wo.kategori === "ROW" && wo.minggu_ke !== null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            <ShieldCheck className="h-8 w-8 text-[#0091B5]" />
            QA & Inspeksi <span className="text-[#FE8200]">ROW</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
            Manajemen khusus Quality Assurance dan clearance ROW.
          </p>
        </div>
        
        {profile?.role === "supervisor" && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Tombol Export Excel khusus QA */}
            <ExportQaButton data={qaOrders} />

            <Link href="/dashboard/qa-inspeksi/baru">
              <Button className="border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-[#0091B5]/40">
                <Plus className="mr-2 h-5 w-5" />
                Buat Laporan QA
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-6 text-xl font-bold text-slate-800">Daftar QA ROW Terbaru</h2>
        
        {qaOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center transition-colors hover:border-[#0091B5]/30 hover:bg-[#0091B5]/5">
            <div className="mb-4 rounded-full bg-white p-4 text-[#0091B5] shadow-sm">
              <ClipboardList className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold text-slate-700">Belum ada laporan QA ROW</p>
            <p className="mt-1 text-sm text-slate-500">Buat laporan pertama Anda dengan mengklik tombol di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {qaOrders.map((qa) => (
              <div key={qa.id} className="transition-all hover:-translate-y-1 hover:drop-shadow-sm">
                <WoCard wo={qa} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}