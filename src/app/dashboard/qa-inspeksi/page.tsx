import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { getWorkOrders, getCurrentUserAndProfile } from "@/lib/data";
import { WoCard } from "@/components/work-order/wo-card";
import { Button } from "@/components/ui/button";
import { ExportQaButton } from "@/components/qa-inspeksi/export-qa-button";
import { PageHeader } from "@/components/layout/page-header";
import { DateFilter } from "@/components/date-filter"; // 🔥 Import komponen filter

export const metadata = { title: "QA & Inspeksi Management" };

// 🔥 Tambahkan searchParams
export default async function QaInspeksiPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const fromDate = params.from;
  const toDate = params.to;

  const [{ profile }, workOrders] = await Promise.all([
    getCurrentUserAndProfile(),
    getWorkOrders(),
  ]);

  // Filter awal untuk mengambil QA (Kategori ROW) 
  // Ditambah filter tambahan agar hanya mengekspor QA yang sudah selesai
  let qaOrders = workOrders.filter(wo => 
    wo.kategori === "ROW" && 
    wo.minggu_ke !== null &&
    (wo.status === "resolved" || wo.status === "closed") // Opsional: Hanya QA yang sudah selesai
  );

  // 🔥 LOGIKA FILTER TANGGAL SEBELUM DI-EXPORT
  if (fromDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = toDate ? new Date(toDate) : new Date(fromDate);
    end.setHours(23, 59, 59, 999);

    qaOrders = qaOrders.filter((wo) => {
      const dateString = wo.closed_at || wo.resolved_at || wo.created_at;
      if (!dateString) return false;
      const woDate = new Date(dateString);
      return woDate >= start && woDate <= end;
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="QA & Inspeksi Management" 
        description="Manajemen khusus Quality Assurance dan clearance ROW yang telah selesai."
        action={
          profile?.role === "supervisor" ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 rounded-lg backdrop-blur-sm p-1">
                <ExportQaButton data={qaOrders} />
              </div>
              <Link href="/dashboard/qa-inspeksi/baru">
                <Button className="border-0 bg-gradient-to-r from-[#F8D90F] to-[#FE8200] font-bold text-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-[#FE8200]/40">
                  <Plus className="mr-2 h-5 w-5" />
                  Buat Laporan 
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Tampilkan Komponen Filter */}
      <DateFilter />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-6 text-xl font-bold text-slate-800">Daftar QA dan Inspeksi Management Selesai</h2>
        
        {qaOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center transition-colors hover:border-[#0091B5]/30 hover:bg-[#0091B5]/5">
            <div className="mb-4 rounded-full bg-white p-4 text-[#0091B5] shadow-sm">
              <ClipboardList className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold text-slate-700">Tidak ada laporan QA sesuai filter</p>
            <p className="mt-1 text-sm text-slate-500">Coba ubah rentang tanggal atau selesaikan laporan QA terlebih dahulu.</p>
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