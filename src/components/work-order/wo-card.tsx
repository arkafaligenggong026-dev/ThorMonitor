import Link from "next/link";
import Image from "next/image";
import { MapPin, Zap, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge, UrgensiBadge } from "./badges";
import { formatTanggal } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

export function WoCard({ wo }: { wo: WorkOrder }) {
  return (
    <Link href={`/dashboard/work-orders/${wo.id}`} className="block outline-none">
      <Card className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-[#0091B5]/30 hover:shadow-lg hover:shadow-[#0091B5]/5 sm:flex-row sm:p-5">
        
        {/* Foto Thumbnail dengan Efek Hover Zoom */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
          <Image
            src={wo.foto_before_url}
            alt={wo.nama_penyulang}
            fill
            sizes="(max-width: 640px) 100vw, 112px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Konten Text */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-slate-500">
              {wo.nomor_wo}
            </p>
            <StatusBadge status={wo.status} />
          </div>
          
          <h3 className="mb-2 flex items-center gap-1.5 truncate text-lg font-bold text-slate-800 transition-colors group-hover:text-[#0091B5]">
            <Zap className="h-4 w-4 shrink-0 text-[#FE8200]" fill="currentColor" />
            {wo.nama_penyulang}
          </h3>
          
          <p className="mb-4 line-clamp-2 text-sm text-slate-500">{wo.deskripsi}</p>
          
          {/* Metadata Bawah (Urgensi, Lokasi, Tanggal) */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
            <UrgensiBadge urgensi={wo.urgensi} />
            
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-[#0091B5]" />
              {wo.alamat ? wo.alamat.split(",").slice(0, 2).join(",") : "Lokasi tercatat"}
            </span>
            
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatTanggal(wo.created_at)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}