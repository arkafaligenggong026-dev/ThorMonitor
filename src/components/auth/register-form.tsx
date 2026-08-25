"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { registerAction } from "@/lib/actions/auth";

// Daftar ULP sesuai wilayah kerja
const ULP_OPTIONS = [
  "ULP Manado Utara",
  "ULP Manado Selatan",
  "ULP Tomohon",
  "ULP Tondano",
  "ULP Airmadidi",
  "ULP Bitung",
  "ULP Ratahan",
  "ULP Amurang",
  "ULP Motoling",
  "ULP Kawangkoan",
  "ULP Paniki"
];

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  
  // State untuk memantau pilihan dropdown
  const [mainRole, setMainRole] = useState(""); // Menyimpan pilihan utama (Inspeksi/Pegawai/Eksekusi)
  const [subRole, setSubRole] = useState("");   // Menyimpan pilihan spesifik jika memilih Tim Eksekusi

  // Trik Sulap: Menentukan role final yang akan dikirim ke database
  const finalRole = mainRole === "tim_eksekusi" ? subRole : mainRole;

  return (
    <>
      <form
        action={formAction}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nip" className="text-slate-700 font-semibold">NIP</Label>
            <Input id="nip" name="nip" placeholder="1998xxxxxx" className="bg-slate-50 transition-colors focus:bg-white" required disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nama_lengkap" className="text-slate-700 font-semibold">Nama Lengkap</Label>
            <Input id="nama_lengkap" name="nama_lengkap" placeholder="Nama Anda" className="bg-slate-50 transition-colors focus:bg-white" required disabled={isPending} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@pln.co.id"
            className="bg-slate-50 transition-colors focus:bg-white"
            required
            autoComplete="email"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold">Kata Sandi</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            className="bg-slate-50 transition-colors focus:bg-white"
            minLength={6}
            required
            autoComplete="new-password"
            disabled={isPending}
          />
        </div>

        {/* INPUT TERSEMBUNYI: Ini yang dibaca oleh database (auth.ts) */}
        <input type="hidden" name="role" value={finalRole} />

        {/* 1. DROPDOWN UTAMA (Hanya 3 Pilihan Bersih) */}
        <div className="space-y-1.5">
          <Label htmlFor="main_role" className="text-slate-700 font-semibold">Peran</Label>
          <Select 
            id="main_role" 
            required 
            value={mainRole}
            onChange={(e) => {
              setMainRole(e.target.value);
              setSubRole(""); // Reset pilihan tim eksekusi jika ganti peran utama
            }}
            disabled={isPending}
            className="bg-slate-50 transition-colors focus:bg-white"
          >
            <option value="" disabled>Pilih peran Anda</option>
            <option value="tim_inspeksi">Tim Inspeksi</option>
            <option value="supervisor">Pegawai (Kantor)</option>
            <option value="tim_eksekusi">Tim Eksekusi (Lapangan)</option>
          </Select>
        </div>

        {/* 2A. MUNCUL JIKA PILIH PEGAWAI: Dropdown ULP */}
        {mainRole === "supervisor" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
            <Label htmlFor="ulp" className="text-slate-700 font-semibold text-[#FE8200]">Pilih Wilayah ULP</Label>
            <Select 
              id="ulp" 
              name="ulp" 
              required 
              defaultValue="" 
              disabled={isPending}
              className="bg-orange-50/50 border-orange-200 text-slate-800 transition-colors focus:bg-white focus:border-[#FE8200]"
            >
              <option value="" disabled>Pilih lokasi ULP Anda...</option>
              {ULP_OPTIONS.map((ulp) => (
                <option key={ulp} value={ulp}>{ulp}</option>
              ))}
            </Select>
          </div>
        )}

        {/* 2B. MUNCUL JIKA PILIH TIM EKSEKUSI: Dropdown Spesialisasi Tim */}
        {mainRole === "tim_eksekusi" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
            <Label htmlFor="sub_role" className="text-slate-700 font-semibold text-[#1E3A8A]">Pilih Spesialisasi Tim</Label>
            <Select 
              id="sub_role" 
              required 
              value={subRole}
              onChange={(e) => setSubRole(e.target.value)}
              disabled={isPending}
              className="bg-blue-50/50 border-blue-200 text-slate-800 transition-colors focus:bg-white focus:border-[#1E3A8A]"
            >
              <option value="" disabled>Pilih spesialisasi tim Anda...</option>
              <option value="tim_rabas">Tim Rabas (Khusus ROW)</option>
              <option value="tim_har_jaringan">Tim Har Jaringan (Konstruksi/Tiang)</option>
              <option value="tim_har_gardu">Tim Har Gardu (Komponen Trafo)</option>
              <option value="tim_pdkb">Tim PDKB</option>
            </Select>
          </div>
        )}

        {/* Pesan Error / Sukses */}
        {state && !state.success && state.message && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}
        {state && state.success && state.message && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Mendaftar..." : "Daftar Sekarang"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-[#0091B5] hover:text-[#1E3A8A] hover:underline transition-colors">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}