import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#FE8200] opacity-15 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#0091B5] opacity-15 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5">
            <Image
              src="/6594c76535ef0-pln.png"
              alt="Logo PLN"
              width={48}
              height={64}
              className="h-14 w-auto object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Daftar Akun <span className="bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] bg-clip-text text-transparent">{APP_NAME}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Buat akun sesuai peran Anda: Tim Inspeksi, Pegawai, atau Tim Eksekusi.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}