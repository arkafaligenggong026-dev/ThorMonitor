import Link from "next/link";
import Image from "next/image";
import { getWorkOrders } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/work-order/badges";
import { formatTanggalSingkat } from "@/lib/utils";
import { ExportButton } from "@/components/work-order/export-button";
import { PageHeader } from "@/components/layout/page-header";
import { DateFilter } from "@/components/date-filter"; // 🔥 Import komponen filter

export const metadata = { title: "Riwayat" };

// 🔥 Tambahkan searchParams untuk menangkap tanggal dari URL
export default async function RiwayatPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const fromDate = params.from;
  const toDate = params.to;

  const workOrders = await getWorkOrders();
  let selesai = workOrders.filter((w) => w.status === "closed" || w.status === "resolved");

  // 🔥 LOGIKA FILTER TANGGAL SEBELUM DI-EXPORT
  if (fromDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0); // Mulai dari jam 00:00:00

    // Jika "Sampai Tanggal" kosong, filter hanya 1 hari (sama dengan "Mulai Tanggal")
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    end.setHours(23, 59, 59, 999); // Sampai jam 23:59:59

    selesai = selesai.filter((wo) => {
      // Gunakan tanggal selesai (resolved_at atau closed_at)
      const dateString = wo.closed_at || wo.resolved_at || wo.created_at;
      if (!dateString) return false;
      const woDate = new Date(dateString);
      return woDate >= start && woDate <= end;
    });
  }

  // Memetakan data (yang sudah tersaring) untuk diekspor ke Excel
  const exportData = selesai.map((wo) => ({
    id: wo.nomor_wo || wo.id,
    kategori: wo.kategori || "-",
    nama_penyulang: wo.nama_penyulang || "-",
    urgensi: wo.urgensi || "-",
    latitude: wo.latitude || 0,
    longitude: wo.longitude || 0,
    foto_after_url: wo.foto_after_url || null,
    closed_at: wo.closed_at || wo.resolved_at || null,
  }));

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Riwayat Pekerjaan" 
        description="Arsip Work Order yang telah diselesaikan, lengkap dengan komparasi foto sebelum-sesudah."
        action={
          <div className="bg-white/10 rounded-lg backdrop-blur-sm p-1">
            <ExportButton data={exportData} />
          </div>
        }
      />

      {/* Tampilkan Komponen Filter */}
      <DateFilter />

      {selesai.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-white">
          Belum ada pekerjaan yang selesai pada rentang waktu ini.
        </div>
      ) : (
        <div className="space-y-3">
          {selesai.map((wo) => (
            <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md border-slate-200">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-400">{wo.nomor_wo}</p>
                    <h3 className="truncate font-semibold text-slate-800">{wo.nama_penyulang}</h3>
                  </div>
                  <StatusBadge status={wo.status} className="shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    <Image src={wo.foto_before_url} alt="Kondisi sebelum" fill className="object-cover" sizes="50vw" />
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">Sebelum</span>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    {wo.foto_after_url && (
                      <>
                        <Image src={wo.foto_after_url} alt="Kondisi sesudah" fill className="object-cover" sizes="50vw" />
                        <span className="absolute bottom-1 left-1 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">Sesudah</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {wo.status === "closed" ? "Ditutup: " : "Selesai dikerjakan: "}
                  <span className="text-[#0091B5]">{formatTanggalSingkat(wo.resolved_at)}</span>
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}