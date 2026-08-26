"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/actions/auth";

const KANTOR_OPTIONS = [
  "UP3 Manado", "ULP Manado Utara", "ULP Manado Selatan", "ULP Tomohon",
  "ULP Tondano", "ULP Airmadidi", "ULP Bitung", "ULP Ratahan",
  "ULP Amurang", "ULP Motoling", "ULP Kawangkoan", "ULP Paniki"
];

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  
  // STATE MANAGEMENT BARU
  const [mainRole, setMainRole] = useState(""); 
  const [subRole, setSubRole] = useState("");   
  const [kantor, setKantor] = useState(""); // Menyimpan pilihan kantor secara real-time

  const finalRole = mainRole === "tim_eksekusi" ? subRole : mainRole;

  return (
    <>
      <form action={formAction} className="space-y-5">
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
          <Input id="email" name="email" type="email" placeholder="nama@pln.co.id" className="bg-slate-50 transition-colors focus:bg-white" required autoComplete="email" disabled={isPending} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold">Kata Sandi</Label>
          <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" className="bg-slate-50 transition-colors focus:bg-white" minLength={6} required autoComplete="new-password" disabled={isPending} />
        </div>

        <input type="hidden" name="role" value={finalRole} />

        <div className="space-y-1.5">
          <Label htmlFor="main_role" className="text-slate-700 font-semibold">Peran</Label>
          <select 
            id="main_role" required value={mainRole}
            onChange={(e) => { 
              setMainRole(e.target.value); 
              setSubRole(""); 
              setKantor(""); // Reset kantor jika role diubah
            }}
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0091B5] disabled:opacity-50"
          >
            <option value="" disabled>Pilih peran Anda...</option>
            <option value="tim_inspeksi">Tim Inspeksi</option>
            <option value="supervisor">Pegawai (Kantor)</option>
            <option value="tim_eksekusi">Tim Eksekusi (Lapangan)</option>
          </select>
        </div>

        {mainRole !== "" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
            <Label htmlFor="ulp" className="text-slate-700 font-semibold text-[#FE8200]">Pilih Kantor (Unit Kerja)</Label>
            <select 
              id="ulp" name="ulp" required 
              value={kantor} // Sekarang dropdown ini dipantau secara real-time
              onChange={(e) => {
                setKantor(e.target.value);
                setSubRole(""); // Reset spesialisasi tim jika kantor diganti
              }}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-orange-200 bg-orange-50/50 px-3 py-2 text-sm text-slate-800 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8200] disabled:opacity-50"
            >
              <option value="" disabled>Pilih lokasi kantor Anda...</option>
              {KANTOR_OPTIONS.map((opsiKantor) => (
                <option key={opsiKantor} value={opsiKantor}>{opsiKantor}</option>
              ))}
            </select>
          </div>
        )}

        {mainRole === "tim_eksekusi" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
            <Label htmlFor="sub_role" className="text-slate-700 font-semibold text-[#1E3A8A]">Pilih Spesialisasi Tim</Label>
            <select 
              id="sub_role" required 
              value={subRole} 
              onChange={(e) => setSubRole(e.target.value)} 
              disabled={isPending || !kantor} // Kunci dropdown ini kalau belum pilih kantor
              className="flex h-10 w-full rounded-md border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm text-slate-800 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Petunjuk dinamis tergantung sudah pilih kantor atau belum */}
              <option value="" disabled>
                {kantor ? "Pilih spesialisasi tim Anda..." : "Pilih kantor terlebih dahulu..."}
              </option>
              
              <option value="tim_rabas">Tim Rabas (Khusus ROW)</option>
              <option value="tim_pemeliharaan">Tim Pemeliharaan (Gardu & Konstruksi)</option>
              
              {/* LOGIKA KUNCI: Opsi PDKB hanya dirender jika kantor persis "UP3 Manado" */}
              {kantor === "UP3 Manado" && (
                <option value="tim_pdkb">Tim PDKB (Pasukan Elit Tanpa Padam)</option>
              )}
            </select>
          </div>
        )}

        {state && !state.success && state.message && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{state.message}</div>
        )}
        {state && state.success && state.message && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{state.message}</div>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Mendaftar..." : "Daftar Sekarang"}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Sudah punya akun? <Link href="/login" className="text-[#0091B5] hover:underline hover:text-[#1E3A8A] transition-colors">Masuk di sini</Link>
      </p>
    </>
  );
}