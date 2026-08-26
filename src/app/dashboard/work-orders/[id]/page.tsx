import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, User, Calendar } from "lucide-react";
import { getWorkOrder, getAllProfiles, getCurrentUserAndProfile } from "@/lib/data";
import { StatusBadge, UrgensiBadge } from "@/components/work-order/badges";
import { BeforeAfter } from "@/components/work-order/before-after";
import { WoDetailActions } from "@/components/work-order/wo-detail-actions";
import { LeafletMap } from "@/components/map/leaflet-map";
import { Card, CardContent } from "@/components/ui/card";
import { formatTanggal } from "@/lib/utils";
import { STATUS_MARKER_COLOR } from "@/lib/constants";

// 🔥 IMPORT TAMBAHAN UNTUK HEADER MEWAH
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default async function WoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [wo, profiles, { user, profile }] = await Promise.all([
    getWorkOrder(id),
    getAllProfiles(),
    getCurrentUserAndProfile(),
  ]);

  if (!wo) notFound();
  if (!user || !profile) redirect("/login");

  const profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  
  // Deteksi otomatis target tim berdasarkan kategori
  const isRow = wo.kategori === "ROW";
  const targetRole = isRow ? "tim_rabas" : "tim_pemeliharaan";
  
  // Hanya ambil profil yang rolenya cocok DAN kantor(ulp)-nya sama dengan si Supervisor
  const eksekutorOptions = profiles.filter(
    (p) => p.role === targetRole && p.ulp === profile.ulp
  );
  
  const pembuat = profilesMap[wo.dibuat_oleh];
  const eksekutor = wo.ditugaskan_ke ? profilesMap[wo.ditugaskan_ke] : null;

  // 🔥 LOGIKA PINTAR: Tombol kembali menyesuaikan dari mana user berasal
  const backLink = isRow ? "/dashboard/qa-inspeksi" : "/dashboard/work-orders";

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER MEWAH DENGAN BANNER NAVY */}
      <PageHeader 
        title={
          <span>
            Detail <span className="text-[#F8D90F]">{isRow ? "QA & Inspeksi ROW" : "Work Order"}</span>
          </span>
        }
        description={
          isRow 
            ? "Informasi lengkap laporan QA dan progres tindak lanjut lapangan." 
            : "Informasi lengkap laporan gangguan dan penugasan tim eksekusi."
        }
        action={
          <Link href={backLink}>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        }
      />

      {/* KOTAK IDENTITAS LAPORAN (Lebih Rapi) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-1 font-mono text-sm font-bold text-slate-400">{wo.nomor_wo}</p>
          <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">{wo.nama_penyulang}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={wo.status} />
          <UrgensiBadge urgensi={wo.urgensi} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
            {wo.kategori}
          </span>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-0">
          <BeforeAfter before={wo.foto_before_url} after={wo.foto_after_url} />

          <div className="px-6 pt-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Deskripsi
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{wo.deskripsi}</p>
          </div>

          {wo.catatan_revisi && (
            <div className="mx-6 rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-sm text-orange-800 shadow-inner">
              <p className="mb-1 font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Catatan Revisi Terakhir:
              </p>
              <p className="text-orange-700">{wo.catatan_revisi}</p>
            </div>
          )}

          <div className="px-6">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <MapPin className="h-4 w-4 text-rose-500" />
              Lokasi
            </p>
            {wo.alamat && <p className="mb-2 text-sm text-slate-700">{wo.alamat}</p>}
            <p className="mb-3 font-mono text-xs font-medium text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">
              {wo.latitude.toFixed(6)}, {wo.longitude.toFixed(6)}
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <LeafletMap
                markers={[
                  {
                    id: wo.id,
                    lat: wo.latitude,
                    lng: wo.longitude,
                    color: STATUS_MARKER_COLOR[wo.status],
                  },
                ]}
                height="200px"
                interactive={false}
                zoom={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-5 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-1.5 text-[#0091B5]">
                <User className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Dilaporkan oleh</p>
                <p className="font-semibold text-slate-700">{pembuat?.nama_lengkap ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-1.5 text-[#FE8200]">
                <Calendar className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Dilaporkan pada</p>
                <p className="font-semibold text-slate-700">{formatTanggal(wo.created_at)}</p>
              </div>
            </div>
            {eksekutor && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                  <User className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Ditugaskan kepada</p>
                  <p className="font-semibold text-slate-700">{eksekutor.nama_lengkap}</p>
                </div>
              </div>
            )}
            {wo.resolved_at && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                  <Calendar className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Selesai dikerjakan</p>
                  <p className="font-semibold text-slate-700">{formatTanggal(wo.resolved_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <WoDetailActions
        wo={wo}
        currentUserId={user.id}
        currentUserRole={profile.role}
        timPemeliharaanOptions={eksekutorOptions} 
      />
    </div>
  );
}