import { Mail, IdCard, Shield, LogOut } from "lucide-react";
import { getCurrentUserAndProfile, getWorkOrders } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABEL } from "@/lib/constants";
import { inisial } from "@/lib/utils";

export const metadata = { title: "Profil" };

export default async function ProfilPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) return null; // dijaga oleh dashboard layout

  const workOrders = await getWorkOrders();
  const jumlahDibuat = workOrders.filter((w) => w.dibuat_oleh === user.id).length;
  const jumlahDitugaskan = workOrders.filter((w) => w.ditugaskan_ke === user.id).length;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Profil Saya</h1>

      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {inisial(profile.nama_lengkap)}
          </div>
          <h2 className="text-lg font-semibold text-ink">{profile.nama_lengkap}</h2>
          <p className="text-sm text-slate-500">{ROLE_LABEL[profile.role]}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <InfoRow icon={IdCard} label="NIP" value={profile.nip} />
          <InfoRow icon={Mail} label="Email" value={user.email ?? "-"} />
          <InfoRow icon={Shield} label="Peran" value={ROLE_LABEL[profile.role]} />
        </CardContent>
      </Card>

      {profile.role === "tim_inspeksi" && (
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{jumlahDibuat}</p>
          <p className="text-xs text-slate-500">Laporan Dibuat</p>
        </Card>
      )}
      {profile.role === "tim_pemeliharaan" && (
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{jumlahDitugaskan}</p>
          <p className="text-xs text-slate-500">Tugas Diterima</p>
        </Card>
      )}

      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          <LogOut className="h-4 w-4" />
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
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
