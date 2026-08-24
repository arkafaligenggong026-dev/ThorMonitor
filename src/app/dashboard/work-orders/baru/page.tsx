import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/data";
import { WoForm } from "@/components/work-order/wo-form";

export const metadata = { title: "Buat Laporan" };

export default async function BuatWoPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "tim_inspeksi") redirect("/dashboard/work-orders");

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link
        href="/dashboard/work-orders"
        className="group inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0091B5] transition-colors"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">Buat Laporan</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Lengkapi detail temuan inspeksi di lapangan.
        </p>
      </div>
      
      {/* Form yang merender input Jenis Inspeksi dll */}
      <WoForm />
    </div>
  );
}