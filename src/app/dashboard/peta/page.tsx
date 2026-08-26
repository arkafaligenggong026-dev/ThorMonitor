import { getWorkOrders } from "@/lib/data";
import { LeafletMap } from "@/components/map/leaflet-map";
import { STATUS_MARKER_COLOR, STATUS_LABEL } from "@/lib/constants";
import type { WoStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Peta Sebaran" };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function PetaPage() {
  const workOrders = await getWorkOrders();

  const markers = workOrders.map((wo) => ({
    id: wo.id,
    lat: wo.latitude,
    lng: wo.longitude,
    color: STATUS_MARKER_COLOR[wo.status],
    popupHtml: `<div style="font-weight:600;margin-bottom:2px">${escapeHtml(
      wo.nomor_wo
    )}</div><div style="margin-bottom:4px">${escapeHtml(
      wo.nama_penyulang
    )}</div><a href="/dashboard/work-orders/${wo.id}" style="color:#00A2E9;font-weight:500;text-decoration:none">Lihat detail &rarr;</a>`,
  }));

  return (
    <div className="space-y-5">
      <PageHeader 
        title="Peta Sebaran Anomali" 
        description="Lokasi seluruh Work Order berdasarkan titik geotagging lapangan."
      />

      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {(Object.keys(STATUS_LABEL) as WoStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: STATUS_MARKER_COLOR[s] }}
            />
            {STATUS_LABEL[s]}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <LeafletMap markers={markers} height="min(60vh, 520px)" />
      </div>

      {workOrders.length === 0 && (
        <p className="text-center text-sm text-slate-500">
          Belum ada Work Order untuk ditampilkan di peta.
        </p>
      )}
    </div>
  );
}