import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function LandingPage() {
  return (
    // Mengunci halaman agar 100% tinggi layar dan tidak bisa di-scroll
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0A192F]">
      
      {/* Background Image menyesuaikan layar */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-screen"
        style={{ backgroundImage: "url('/bg-landing.png')" }}
      />

      {/* Overlay gradien tipis agar teks lebih terbaca */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/20 to-transparent opacity-90" />

      {/* HEADER DIHAPUS KARENA SUDAH ADA TOMBOL UTAMA DI TENGAH */}

      {/* MAIN CONTENT (Hero Section) */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 pb-10">
        
        {/* LOGO & NAMA APLIKASI DI TENGAH */}
        <div className="mb-6 flex flex-col items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <Image 
            src="/logo-petir.png" 
            alt="Logo PLN Petir" 
            width={64} 
            height={64} 
            className="h-14 sm:h-16 w-auto drop-shadow-[0_2px_10px_rgba(248,217,15,0.4)]" 
            priority
          />
          <span className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md tracking-tight">
            {APP_NAME}
          </span>
        </div>

        {/* Badge Sistem Internal */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-sky-200 backdrop-blur-sm mb-6 sm:mb-8 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <ShieldCheck className="h-4 w-4" />
          Sistem Internal PT PLN (Persero)
        </div>

        {/* Judul Raksasa */}
        <h1 className="mx-auto max-w-5xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl drop-shadow-lg leading-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          Manajemen Work Order, <br className="hidden sm:block" />
          QA, dan Inspeksi <br className="hidden sm:block" />
          <span className="text-[#F8D90F] drop-shadow-[0_2px_15px_rgba(248,217,15,0.4)]">
            Jaringan Distribusi
          </span>
        </h1>

        {/* Sub-judul Penjelasan Singkat */}
        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base lg:text-lg text-sky-100/90 drop-shadow-md leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          ThorMonitor menjembatani Tim QA, Tim Inspeksi, Pegawai, dan Tim Eksekusi dalam satu alur kerja berbasis geotagging — dari temuan di lapangan hingga verifikasi perbaikan.
        </p>

        {/* Tombol Aksi Raksasa */}
        <div className="mt-8 sm:mt-12 flex flex-col w-full max-w-xs sm:max-w-none sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/register" 
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F8D90F] px-8 py-3.5 text-sm sm:text-base font-bold text-slate-900 transition-all hover:bg-[#E5C800] hover:scale-105 hover:shadow-[0_0_25px_rgba(248,217,15,0.5)] sm:w-auto"
          >
            Mulai Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/login" 
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 sm:w-auto"
          >
            Saya Sudah Punya Akun
          </Link>
        </div>
      </main>

      {/* FOOTER - Minimalis tanpa logo */}
      <footer className="relative z-10 py-5 text-center text-xs sm:text-sm text-sky-200/60 backdrop-blur-sm bg-slate-950/40 border-t border-white/10 shrink-0">
        <p>© 2026 PT PLN (Persero). Hak Cipta Dilindungi.</p>
      </footer>
      
    </div>
  );
}