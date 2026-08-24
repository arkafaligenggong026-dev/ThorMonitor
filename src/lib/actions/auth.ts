"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Role } from "@/lib/types";

/**
 * FR-1.2: Login memakai NIP atau Email + password (Supabase Auth).
 * Jika input bukan format email, diterjemahkan dulu ke email lewat RPC
 * `get_email_by_nip` (lihat supabase/migrations/0001_init.sql).
 */
export async function loginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!identifier || !password) {
    return { success: false, message: "NIP/Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();

  let email = identifier;
  if (!identifier.includes("@")) {
    const { data: emailFromNip, error: rpcError } = await supabase.rpc("get_email_by_nip", {
      nip_input: identifier,
    });

    if (rpcError || !emailFromNip) {
      return { success: false, message: "NIP tidak terdaftar." };
    }
    email = emailFromNip as string;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: "NIP/Email atau kata sandi salah." };
  }

  revalidatePath("/", "layout");
  redirect(next || "/dashboard");
}

/**
 * Registrasi akun baru. Membuat user di Supabase Auth sekaligus baris
 * profil (nip, nama_lengkap, role, ulp) — juga dijaga oleh trigger
 * `handle_new_user` di database sebagai jaring pengaman.
 */
export async function registerAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const nip = String(formData.get("nip") ?? "").trim();
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  
  // Tangkap data ULP (Bisa null jika role bukan supervisor)
  const ulp = formData.get("ulp") ? String(formData.get("ulp")) : null;

  if (!nip || !nama_lengkap || !email || !password || !role) {
    return { success: false, message: "Semua kolom wajib diisi." };
  }
  
  // Validasi khusus: Jika role adalah supervisor (Pegawai), ULP wajib diisi!
  if (role === "supervisor" && !ulp) {
    return { success: false, message: "Pegawai wajib memilih lokasi ULP." };
  }

  if (password.length < 6) {
    return { success: false, message: "Kata sandi minimal 6 karakter." };
  }

  const supabase = await createClient();

  // Simpan data pendaftaran ke Supabase Auth (metadata)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nip, nama_lengkap, role, ulp }, // ulp ikut diselipkan ke metadata
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, message: "Email sudah terdaftar." };
    }
    return { success: false, message: error.message };
  }

  if (data.user && !data.session) {
    return {
      success: true,
      message: "Pendaftaran berhasil. Silakan cek email untuk konfirmasi sebelum masuk.",
    };
  }

  // Jaring pengaman: pastikan baris profil masuk ke tabel `profiles` 
  // termasuk kolom `ulp` yang baru kita buat.
  if (data.user) {
    await supabase
      .from("profiles")
      .upsert({ 
        id: data.user.id, 
        nip, 
        nama_lengkap, 
        role, 
        ulp  // <-- ULP disimpan ke tabel profiles di sini
      }, { onConflict: "id" });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}