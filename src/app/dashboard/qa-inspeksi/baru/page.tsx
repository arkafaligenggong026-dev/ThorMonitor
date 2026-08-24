import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/data";
import { QaForm } from "@/components/qa-inspeksi/qa-form";

export const metadata = { title: "Buat Laporan QA" };

export default async function BuatQaPage() {
  const { profile } = await getCurrentUserAndProfile();
  
  if (!profile) redirect("/login");
  
  // Proteksi: Jika bukan pegawai, tendang kembali ke dashboard
  if (profile.role !== "supervisor") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/dashboard/qa-inspeksi"
        className="group inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0091B5] transition-colors"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke QA & Inspeksi
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          FORM QUALITY ASSURANCE & <span className="text-[#FE8200]">INSPEKSI</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Lengkapi detail inspeksi khusus ROW di bawah ini.
        </p>
      </div>
      
      <QaForm />
    </div>
  );
}