import Link from "next/link";
import { Plus } from "lucide-react";
import { getWorkOrders, getCurrentUserAndProfile } from "@/lib/data";
import { WoCard } from "@/components/work-order/wo-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { STATUS_LABEL } from "@/lib/constants";
import type { WorkOrder, WoStatus } from "@/lib/types";

export const metadata = { title: "Work Order" };

const TAB_STATUSES: WoStatus[] = ["open", "assigned", "in_progress", "resolved", "closed"];

export default async function WorkOrdersPage() {
  const [workOrders, { profile }] = await Promise.all([
    getWorkOrders(),
    getCurrentUserAndProfile(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Work Order</h1>
          <p className="text-sm text-slate-500">
            Daftar seluruh laporan gangguan jaringan distribusi.
          </p>
        </div>
        {profile?.role === "tim_inspeksi" && (
          <Link href="/dashboard/work-orders/baru" className="hidden sm:block">
            <Button>
              <Plus className="h-4 w-4" />
              Buat Laporan
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="semua">
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="semua">Semua ({workOrders.length})</TabsTrigger>
            {TAB_STATUSES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {STATUS_LABEL[s]} ({workOrders.filter((w) => w.status === s).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="semua">
          <DaftarWo items={workOrders} />
        </TabsContent>
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
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        Tidak ada Work Order pada kategori ini.
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
