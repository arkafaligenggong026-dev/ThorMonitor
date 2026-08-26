import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
     <div 
  className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
  style={{
    backgroundImage: "url('/bg-batik-light.png')",
    backgroundSize: "550px", // <-- Kunci zoom out-nya di sini (bisa diubah angkanya)
    backgroundRepeat: "repeat", // <-- Memaksa gambar berulang seperti susunan ubin
    backgroundColor: "rgba(248, 250, 252, 0.6)", 
    backgroundBlendMode: "overlay"
  }}
>
      {/* Hiasan Latar Belakang Gradasi PLN */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#0091B5] opacity-20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#F8D90F] opacity-20 blur-3xl" />

      {/* Kotak Login dengan Efek Kaca (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6">
            {/* Menggunakan Logo Vertikal (Portrait) Sesuai Nama Asli */}
            <Image
              src="/PLN Logo - Colored - zonalogo.com.png"
              alt="Logo PLN"
              width={100}
              height={120}
              className="h-24 w-auto object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Masuk ke <span className="bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] bg-clip-text text-transparent">{APP_NAME}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Gunakan NIP atau Email terdaftar Anda.</p>
        </div>

        <LoginForm next={next ?? "/dashboard"} />
      </div>
    </div>
  );
}