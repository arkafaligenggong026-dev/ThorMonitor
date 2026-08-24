import Link from "next/link";
import Image from "next/image";
import { getWorkOrders } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/work-order/badges";
import { formatTanggalSingkat } from "@/lib/utils";
import { ExportButton } from "@/components/work-order/export-button";

export const metadata = { title: "Riwayat" };

export default async function RiwayatPage() {
  const workOrders = await getWorkOrders();
  const selesai = workOrders.filter((w) => w.status === "closed" || w.status === "resolved");

  // Memetakan data untuk diekspor ke Excel
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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Riwayat Pekerjaan</h1>
          <p className="text-sm text-slate-500">
            Arsip Work Order yang telah diselesaikan, lengkap dengan komparasi foto sebelum-sesudah.
          </p>
        </div>
        {/* Tombol Export Excel */}
        <ExportButton data={exportData} />
      </div>

      {selesai.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Belum ada pekerjaan yang selesai.
        </div>
      ) : (
        <div className="space-y-3">
          {selesai.map((wo) => (
            <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-400">{wo.nomor_wo}</p>
                    <h3 className="truncate font-semibold text-ink">{wo.nama_penyulang}</h3>
                  </div>
                  <StatusBadge status={wo.status} className="shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={wo.foto_before_url}
                      alt="Kondisi sebelum"
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Sebelum
                    </span>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
                    {wo.foto_after_url && (
                      <>
                        <Image
                          src={wo.foto_after_url}
                          alt="Kondisi sesudah"
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Sesudah
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {wo.status === "closed" ? "Ditutup" : "Selesai dikerjakan"}{" "}
                  {formatTanggalSingkat(wo.resolved_at)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}