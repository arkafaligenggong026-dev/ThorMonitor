import { Mail, IdCard, Shield, LogOut, MapPin } from "lucide-react";
import { getCurrentUserAndProfile, getWorkOrders } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABEL, EKSEKUSI_ROLES } from "@/lib/constants";
import { inisial } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Profil" };

export default async function ProfilPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) return null; 

  const workOrders = await getWorkOrders();
  const jumlahDibuat = workOrders.filter((w) => w.dibuat_oleh === user.id).length;
  const jumlahDitugaskan = workOrders.filter((w) => w.ditugaskan_ke === user.id).length;

  // PERBAIKAN: Gabungkan role dengan nama kantornya
  const roleLengkap = profile.ulp 
    ? `${ROLE_LABEL[profile.role]} - ${profile.ulp}` 
    : ROLE_LABEL[profile.role];

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Profil Pengguna" 
        description="Kelola informasi akun dan wilayah tugas Anda di aplikasi."
      />

      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 text-center bg-white">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0091B5] to-[#1E3A8A] text-4xl font-extrabold text-white shadow-lg ring-4 ring-slate-50">
            {inisial(profile.nama_lengkap)}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{profile.nama_lengkap}</h2>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#FE8200]">
            <Shield className="h-4 w-4" />
            {roleLengkap}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="divide-y divide-slate-100">
          <InfoRow 
            icon={IdCard} label="NOMOR INDUK PEGAWAI (NIP)" value={profile.nip} 
            iconColor="text-[#0091B5]" iconBg="bg-blue-50" 
          />
          <InfoRow 
            icon={Mail} label="ALAMAT EMAIL" value={user.email ?? "-"} 
            iconColor="text-[#0091B5]" iconBg="bg-blue-50" 
          />
          {profile.ulp && (
            <InfoRow 
              icon={MapPin} label="UNIT KERJA (KANTOR)" value={profile.ulp} 
              iconColor="text-[#FE8200]" iconBg="bg-orange-50" 
            />
          )}
        </div>
      </Card>

      {/* Tampil untuk Tim Inspeksi */}
      {profile.role === "tim_inspeksi" && (
        <Card className="p-4 text-center border-[#0091B5]/20 bg-[#0091B5]/5 shadow-sm">
          <p className="text-3xl font-bold text-[#0091B5]">{jumlahDibuat}</p>
          <p className="text-sm font-medium text-slate-600">Laporan Temuan Dibuat</p>
        </Card>
      )}

      {/* Tampil untuk Semua Jenis Tim Eksekusi */}
      {EKSEKUSI_ROLES.includes(profile.role) && (
        <Card className="p-4 text-center border-[#FE8200]/20 bg-[#FE8200]/5 shadow-sm">
          <p className="text-3xl font-bold text-[#FE8200]">{jumlahDitugaskan}</p>
          <p className="text-sm font-medium text-slate-600">WO Ditugaskan Kepada Anda</p>
        </Card>
      )}

      <form action={logoutAction} className="pt-2">
        <Button type="submit" variant="destructive" size="lg" className="w-full h-14 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all">
          <LogOut className="mr-2 h-5 w-5" />
          Keluar dari Akun
        </Button>
      </form>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-slate-500",
  iconBg = "bg-slate-100"
}: {
  icon: any;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor} shadow-inner`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}