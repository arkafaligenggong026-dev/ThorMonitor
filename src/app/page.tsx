import Link from "next/link";
import Image from "next/image";
import {
  MapPinned,
  Camera,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const FITUR = [
  {
    icon: Camera,
    title: "Pelaporan Cepat + Foto",
    desc: "Tim Inspeksi membuat Work Order langsung dari lapangan lengkap dengan foto kondisi inspeksi.",
    gradient: "from-[#F8D90F] to-[#FE8200]", 
  },
  {
    icon: MapPinned,
    title: "Geotagging Otomatis",
    desc: "Titik koordinat lokasi inspeksi terekam otomatis dari GPS perangkat — akurat dan mudah diaudit.",
    gradient: "from-[#0091B5] to-[#007A99]",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard & Peta GIS",
    desc: "Pegawai memantau sebaran temuan inspeksi secara real-time lewat peta interaktif dan ringkasan statistik.",
    gradient: "from-[#FE8200] to-[#CE0900]",
  },
  {
    icon: ClipboardCheck,
    title: "Verifikasi Before-After",
    desc: "Hasil pekerjaan diverifikasi dengan membandingkan foto sebelum dan sesudah perbaikan.",
    gradient: "from-[#0091B5] to-[#1E3A8A]",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Menggunakan Logo Horizontal (Landscape) */}
            <Image
              src="/6594c76535ef0-pln.png"
              alt="Logo PLN"
              width={140}
              height={48}
              className="h-10 w-auto object-contain drop-shadow-sm"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              {APP_NAME}
            </span>
          </div>

          {/* Tombol Header Kanan Atas yang Kini Seimbang */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0091B5] transition-all"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                className="border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-[#0091B5]/30"
              >
                Daftar
              </Button>
            </Link>
          </div>

        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
          <div className="absolute -top-20 right-0 -z-10 h-64 w-64 rounded-full bg-[#0091B5] opacity-10 blur-3xl" />
          <div className="absolute top-40 -left-20 -z-10 h-64 w-64 rounded-full bg-[#F8D90F] opacity-10 blur-3xl" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#0091B5]/20 bg-[#0091B5]/5 px-4 py-1.5 text-xs font-semibold text-[#0091B5]">
              <ShieldCheck className="h-4 w-4" />
              Sistem Internal PT PLN (Persero)
            </span>
            
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-800">
              Manajemen Work Order <br />
              <span className="bg-gradient-to-r from-[#0091B5] via-[#1E3A8A] to-[#0091B5] bg-clip-text text-transparent bg-300% animate-gradient">
                Inspeksi Jaringan Distribusi
              </span>
            </h1>
            
            <p className="mb-10 text-lg leading-relaxed text-slate-500 sm:text-xl">
              {APP_NAME} menjembatani Tim Inspeksi, Pegawai, dan Tim Eksekusi dalam satu
              alur kerja berbasis geotagging — dari temuan di lapangan hingga
              verifikasi perbaikan.
            </p>
            
            {/* Tombol Aksi Utama */}
            <div className="flex flex-col justify-center items-center gap-4 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="h-12 w-full sm:w-auto border-0 bg-gradient-to-r from-[#F8D90F] to-[#FE8200] px-8 text-base font-bold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FE8200]/30">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="h-12 w-full sm:w-auto border-2 border-slate-200 bg-white px-8 text-base font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                  Saya Sudah Punya Akun
                </Button>
              </Link>
            </div>

          </div>
        </section>

        <section className="bg-white py-20 sm:py-24 shadow-sm border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Alur Kerja Terintegrasi</h2>
              <p className="mt-4 text-lg text-slate-500">
                Satu aplikasi responsif untuk tiga peran vital di lapangan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FITUR.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-md transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-800">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { peran: "Tim Inspeksi", tugas: "Melakukan inspeksi & melaporkan temuan lengkap dengan foto dan lokasi GPS.", color: "from-[#0091B5] to-[#007A99]" },
              { peran: "Pegawai", tugas: "Meninjau laporan, menugaskan tim eksekusi, dan memverifikasi hasil kerja.", color: "from-[#FE8200] to-[#CE0900]" },
              { peran: "Tim Eksekusi", tugas: "Mengerjakan perbaikan di lokasi dan melaporkan hasil kerja secara real-time.", color: "from-[#1E3A8A] to-[#0f1d45]" },
            ].map((r) => (
              <div key={r.peran} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${r.color} p-8 text-white shadow-lg`}>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white opacity-10 blur-2xl" />
                <h3 className="mb-3 text-xl font-bold">{r.peran}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-90">{r.tugas}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-400 sm:px-6">
          <span className="font-semibold text-slate-500">{APP_NAME}</span> — Sistem Manajemen Work Order Terintegrasi Berbasis Geotagging <br className="sm:hidden"/> PT PLN (Persero).
        </div>
      </footer>
    </div>
  );
}