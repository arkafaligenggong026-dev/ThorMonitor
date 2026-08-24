"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { registerAction } from "@/lib/actions/auth";
import { ROLE_OPTIONS } from "@/lib/constants";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <>
      <form
        action={formAction}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nip" className="text-slate-700">NIP</Label>
            <Input id="nip" name="nip" placeholder="1998xxxxxx" className="bg-white/50 transition-colors focus:bg-white" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nama_lengkap" className="text-slate-700">Nama Lengkap</Label>
            <Input id="nama_lengkap" name="nama_lengkap" placeholder="Nama Anda" className="bg-white/50 transition-colors focus:bg-white" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@pln.co.id"
            className="bg-white/50 transition-colors focus:bg-white"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700">Kata Sandi</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            className="bg-white/50 transition-colors focus:bg-white"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-slate-700">Peran</Label>
          <Select id="role" name="role" required defaultValue="" className="bg-white/50 transition-colors focus:bg-white">
            <option value="" disabled>
              Pilih peran Anda
            </option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

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

        <Button type="submit" className="w-full border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] text-white font-bold shadow-md hover:shadow-lg transition-all" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Mendaftar..." : "Daftar Sekarang"}
        </Button>
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