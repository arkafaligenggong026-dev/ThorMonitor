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
  const timPemeliharaanOptions = profiles.filter((p) => p.role === "tim_pemeliharaan");

  const pembuat = profilesMap[wo.dibuat_oleh];
  const eksekutor = wo.ditugaskan_ke ? profilesMap[wo.ditugaskan_ke] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/dashboard/work-orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="font-mono text-sm text-slate-400">{wo.nomor_wo}</p>
          <StatusBadge status={wo.status} />
        </div>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{wo.nama_penyulang}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <UrgensiBadge urgensi={wo.urgensi} />
          <span className="text-sm text-slate-500">{wo.kategori}</span>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <BeforeAfter before={wo.foto_before_url} after={wo.foto_after_url} />

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Deskripsi
            </p>
            <p className="text-sm text-ink">{wo.deskripsi}</p>
          </div>

          {wo.catatan_revisi && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              <p className="mb-1 font-semibold">Catatan Revisi Terakhir:</p>
              <p>{wo.catatan_revisi}</p>
            </div>
          )}

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              Lokasi
            </p>
            {wo.alamat && <p className="mb-2 text-sm text-ink">{wo.alamat}</p>}
            <p className="mb-2 font-mono text-xs text-slate-500">
              {wo.latitude.toFixed(6)}, {wo.longitude.toFixed(6)}
            </p>
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

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Dilaporkan oleh</p>
                <p className="text-ink">{pembuat?.nama_lengkap ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Dilaporkan pada</p>
                <p className="text-ink">{formatTanggal(wo.created_at)}</p>
              </div>
            </div>
            {eksekutor && (
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Ditugaskan kepada</p>
                  <p className="text-ink">{eksekutor.nama_lengkap}</p>
                </div>
              </div>
            )}
            {wo.resolved_at && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Selesai dikerjakan</p>
                  <p className="text-ink">{formatTanggal(wo.resolved_at)}</p>
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
        timPemeliharaanOptions={timPemeliharaanOptions}
      />
    </div>
  );
}
