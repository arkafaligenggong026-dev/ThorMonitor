import Link from "next/link";
import { Plus } from "lucide-react";
import { getWorkOrders, getCurrentUserAndProfile } from "@/lib/data";
import { WoCard } from "@/components/work-order/wo-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { STATUS_LABEL } from "@/lib/constants";
import type { WorkOrder, WoStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Work Order" };

const TAB_STATUSES: WoStatus[] = ["open", "assigned", "in_progress", "resolved", "closed"];

export default async function WorkOrdersPage() {
  const [workOrders, { profile }] = await Promise.all([
    getWorkOrders(),
    getCurrentUserAndProfile(),
  ]);

  // 🔥 LOGIKA PEMISAH: Memisahkan WO biasa dan QA ROW
  const regulerOrders = workOrders.filter((w) => w.kategori !== "ROW");
  const qaOrders = workOrders.filter((w) => w.kategori === "ROW");

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Work Order" 
        description="Daftar seluruh laporan temuan dan anomali jaringan distribusi."
        action={
          // Tombol buat laporan WO HANYA untuk Tim Inspeksi
          profile?.role === "tim_inspeksi" ? (
            <Link href="/dashboard/work-orders/baru" className="hidden sm:block">
              <Button className="border-0 bg-gradient-to-r from-[#F8D90F] to-[#FE8200] font-bold text-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-[#FE8200]/40">
                <Plus className="mr-2 h-4 w-4" />
                Buat Laporan
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Tabs defaultValue="semua">
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          {/* Ditambahkan min-w-max agar tab tidak terpotong saat digeser di HP */}
          <TabsList className="min-w-max">
            <TabsTrigger value="semua">Semua ({workOrders.length})</TabsTrigger>
            
            {/* 🌟 TAB PEMISAH BARU (Diletakkan di antara Semua dan Menunggu) */}
            <TabsTrigger value="wo_reguler" className="font-semibold text-sky-600 data-[state=active]:text-sky-700">
              WO Reguler ({regulerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="qa" className="font-semibold text-orange-600 data-[state=active]:text-orange-700">
              QA & ROW ({qaOrders.length})
            </TabsTrigger>

            {TAB_STATUSES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {STATUS_LABEL[s]} ({workOrders.filter((w) => w.status === s).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Konten Tab Semua */}
        <TabsContent value="semua">
          <DaftarWo items={workOrders} />
        </TabsContent>
        
        {/* 🌟 Konten Tab Pemisah Baru */}
        <TabsContent value="wo_reguler">
          <DaftarWo items={regulerOrders} />
        </TabsContent>
        <TabsContent value="qa">
          <DaftarWo items={qaOrders} />
        </TabsContent>

        {/* Konten Tab Status */}
        {TAB_STATUSES.map((s) => (
          <TabsContent key={s} value={s}>
            <DaftarWo items={workOrders.filter((w) => w.status === s)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DaftarWo({ items }: { items: WorkOrder[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-white">
        Tidak ada laporan pada kategori ini.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((wo) => (
        <WoCard key={wo.id} wo={wo} />
      ))}
    </div>
  );
}