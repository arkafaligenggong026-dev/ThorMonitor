import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Building2 } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/data";
import { QaForm } from "@/components/qa-inspeksi/qa-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Buat Laporan QA" };

export default async function BuatQaPage() {
  const { profile } = await getCurrentUserAndProfile();
  
  if (!profile) redirect("/login");
  
  // Proteksi: Jika bukan pegawai, tendang kembali ke dashboard
  if (profile.role !== "supervisor") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Menggunakan Banner Navy yang Elegan */}
      <PageHeader 
        title={
          <span>
            Form Quality Assurance & <span className="text-[#F8D90F]">Inspeksi</span>
          </span>
        }
        description="Lengkapi detail inspeksi khusus ROW dan Management di bawah ini."
        action={
          <Link href="/dashboard/qa-inspeksi">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        }
      />
      
      {/* IDENTITAS KANTOR (Otomatis & Tidak bisa diedit) */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 p-2.5 text-[#FE8200]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">KANTOR ASAL PELAPOR</p>
            <p className="font-semibold text-slate-800">{profile.ulp || "Kantor Pusat"}</p>
          </div>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
          Otomatis Tercatat
        </div>
      </div>

      {/* Form Utama */}
      <QaForm />
    </div>
  );
}