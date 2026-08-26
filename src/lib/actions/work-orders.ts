"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Profile } from "@/lib/types";

// Konstanta untuk mengidentifikasi semua role yang bekerja di lapangan
const EKSEKUSI_ROLES = ["tim_pemeliharaan", "tim_rabas", "tim_pdkb"];

async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { supabase, user, profile };
}

export interface BuatWorkOrderInput {
  jenis_gangguan: string;
  nama_penyulang: string;
  deskripsi: string;
  urgensi: string;
  latitude: number;
  longitude: number;
  alamat: string | null;
  foto_before_url: string;
}

/**
 * FR-2.1 — FR-2.3: Tim Inspeksi membuat laporan WO baru lengkap dengan
 * titik koordinat (geotagging) dan foto kondisi awal. Status awal selalu
 * "open".
 */
export async function createWorkOrder(input: BuatWorkOrderInput): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  if (profile.role !== "tim_inspeksi") {
    return { success: false, message: "Hanya Tim Inspeksi yang dapat membuat Work Order." };
  }
  
  if (!input.jenis_gangguan || !input.nama_penyulang || !input.deskripsi || !input.urgensi) {
    return { success: false, message: "Mohon lengkapi semua kolom laporan." };
  }
  if (!input.foto_before_url) {
    return { success: false, message: "Foto kondisi awal (Before) wajib diunggah." };
  }

  const { error } = await supabase.from("work_orders").insert({
    kategori: input.jenis_gangguan, 
    nama_penyulang: input.nama_penyulang,
    deskripsi: input.deskripsi,
    urgensi: input.urgensi,
    latitude: input.latitude,
    longitude: input.longitude,
    alamat: input.alamat,
    foto_before_url: input.foto_before_url,
    status: "open",
    dibuat_oleh: user.id,
    asal_kantor: profile.ulp, // 🔥 PERBAIKAN: Menyimpan kantor otomatis
  });

  if (error) return { success: false, message: `Gagal menyimpan laporan: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/work-orders");
  revalidatePath("/dashboard/peta");
  return { success: true, message: "Laporan Work Order berhasil dibuat." };
}

/**
 * FR-2.4: Supervisor menugaskan WO berstatus "open" ke seorang anggota
 * Tim Eksekusi. Status berubah open -> assigned.
 */
export async function assignWorkOrder(id: string, ditugaskanKe: string): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  if (profile.role !== "supervisor") {
    return { success: false, message: "Hanya Supervisor yang dapat menugaskan Work Order." };
  }

  const { data: wo } = await supabase.from("work_orders").select("status").eq("id", id).single();
  if (!wo) return { success: false, message: "Work Order tidak ditemukan." };
  if (wo.status !== "open") {
    return { success: false, message: "Work Order ini sudah ditugaskan sebelumnya." };
  }

  const { error } = await supabase
    .from("work_orders")
    .update({
      status: "assigned",
      ditugaskan_ke: ditugaskanKe,
      ditugaskan_oleh: user.id,
      assigned_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "open");

  if (error) return { success: false, message: `Gagal menugaskan: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/work-orders/${id}`);
  revalidatePath("/dashboard/work-orders");
  revalidatePath("/dashboard/peta");
  return { success: true, message: "Work Order berhasil ditugaskan." };
}

/**
 * Tim Eksekusi mengonfirmasi mulai bekerja. Status assigned -> in_progress.
 */
export async function startWorkOrder(id: string): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  
  if (!EKSEKUSI_ROLES.includes(profile.role)) {
    return { success: false, message: "Hanya Tim Eksekusi (Lapangan) yang dapat memulai pekerjaan ini." };
  }

  const { data: wo } = await supabase
    .from("work_orders")
    .select("status, ditugaskan_ke")
    .eq("id", id)
    .single();
  if (!wo) return { success: false, message: "Work Order tidak ditemukan." };
  if (wo.ditugaskan_ke !== user.id) {
    return { success: false, message: "Work Order ini tidak ditugaskan kepada Anda." };
  }
  if (wo.status !== "assigned") {
    return { success: false, message: "Work Order ini tidak dalam status siap dikerjakan." };
  }

  const { error } = await supabase
    .from("work_orders")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "assigned");

  if (error) return { success: false, message: `Gagal memulai pekerjaan: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/work-orders/${id}`);
  revalidatePath("/dashboard/work-orders");
  return { success: true, message: "Pekerjaan dimulai." };
}

/**
 * FR-2.5: Tim Eksekusi menyelesaikan pekerjaan & melampirkan foto
 * hasil kerja (After). Status in_progress -> resolved (menunggu
 * verifikasi Supervisor).
 */
export async function resolveWorkOrder(id: string, fotoAfterUrl: string): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  
  if (!EKSEKUSI_ROLES.includes(profile.role)) {
    return { success: false, message: "Hanya Tim Eksekusi (Lapangan) yang dapat menyelesaikan pekerjaan ini." };
  }
  
  if (!fotoAfterUrl) {
    return { success: false, message: "Foto hasil kerja (After) wajib diunggah." };
  }

  const { data: wo } = await supabase
    .from("work_orders")
    .select("status, ditugaskan_ke")
    .eq("id", id)
    .single();
  if (!wo) return { success: false, message: "Work Order tidak ditemukan." };
  if (wo.ditugaskan_ke !== user.id) {
    return { success: false, message: "Work Order ini tidak ditugaskan kepada Anda." };
  }
  if (wo.status !== "in_progress") {
    return { success: false, message: "Work Order ini belum dalam pengerjaan." };
  }

  const { error } = await supabase
    .from("work_orders")
    .update({
      status: "resolved",
      foto_after_url: fotoAfterUrl,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "in_progress");

  if (error) return { success: false, message: `Gagal menyelesaikan pekerjaan: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/work-orders/${id}`);
  revalidatePath("/dashboard/work-orders");
  revalidatePath("/dashboard/riwayat");
  revalidatePath("/dashboard/peta");
  return { success: true, message: "Pekerjaan selesai, menunggu verifikasi Supervisor." };
}

/**
 * Supervisor memverifikasi hasil kerja (bandingkan foto Before-After).
 * Disetujui -> status closed. Ditolak -> kembali ke in_progress dengan
 * catatan revisi.
 */
export async function verifyWorkOrder(
  id: string,
  approved: boolean,
  catatanRevisi?: string
): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  if (profile.role !== "supervisor") {
    return { success: false, message: "Hanya Supervisor yang dapat memverifikasi Work Order." };
  }

  const { data: wo } = await supabase.from("work_orders").select("status").eq("id", id).single();
  if (!wo) return { success: false, message: "Work Order tidak ditemukan." };
  if (wo.status !== "resolved") {
    return { success: false, message: "Work Order ini belum menunggu verifikasi." };
  }

  if (approved) {
    const { error } = await supabase
      .from("work_orders")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "resolved");
    if (error) return { success: false, message: `Gagal menutup Work Order: ${error.message}` };

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/work-orders/${id}`);
    revalidatePath("/dashboard/work-orders");
    revalidatePath("/dashboard/riwayat");
    revalidatePath("/dashboard/peta");
    return { success: true, message: "Work Order disetujui dan ditutup." };
  }

  if (!catatanRevisi) {
    return { success: false, message: "Mohon isi catatan revisi sebelum menolak." };
  }

  const { error } = await supabase
    .from("work_orders")
    .update({ status: "in_progress", catatan_revisi: catatanRevisi })
    .eq("id", id)
    .eq("status", "resolved");
  if (error) return { success: false, message: `Gagal mengirim revisi: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/work-orders/${id}`);
  revalidatePath("/dashboard/work-orders");
  return { success: true, message: "Dikembalikan ke Tim Eksekusi untuk revisi." };
}

// ============================================================================
// FITUR KHUSUS QA & INSPEKSI ROW (PEGAWAI)
// ============================================================================

export interface BuatQaInput {
  minggu_ke: number;
  inspektor: string;
  kms: string;
  rencana_tindak: string;
  nama_penyulang: string;
  urgensi: string;
  latitude: number;
  longitude: number;
  alamat: string | null;
  foto_before_url: string;
}

/**
 * Pegawai membuat laporan QA khusus ROW.
 */
export async function createQaInspeksi(input: BuatQaInput): Promise<ActionResult> {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user || !profile) return { success: false, message: "Sesi tidak valid, silakan masuk kembali." };
  
  if (profile.role !== "supervisor") {
    return { success: false, message: "Hanya Pegawai yang dapat membuat laporan QA & Inspeksi." };
  }
  
  if (!input.minggu_ke || !input.inspektor || !input.kms || !input.rencana_tindak || !input.nama_penyulang || !input.urgensi) {
    return { success: false, message: "Mohon lengkapi semua kolom QA." };
  }
  if (!input.foto_before_url) {
    return { success: false, message: "Foto kondisi awal (Before) wajib diunggah." };
  }

  const deskripsiOtomatis = `QA Inspeksi ROW - Minggu Ke-${input.minggu_ke} | Inspektor: ${input.inspektor} | KMS: ${input.kms}`;

  const { error } = await supabase.from("work_orders").insert({
    kategori: "ROW", 
    nama_penyulang: input.nama_penyulang,
    deskripsi: deskripsiOtomatis,
    urgensi: input.urgensi,
    latitude: input.latitude,
    longitude: input.longitude,
    alamat: input.alamat,
    foto_before_url: input.foto_before_url,
    status: "open",
    dibuat_oleh: user.id,
    
    // 🔥 PERBAIKAN: Menyimpan data asal kantor secara otomatis
    asal_kantor: profile.ulp, 
    
    minggu_ke: input.minggu_ke,
    inspektor: input.inspektor,
    kms: input.kms,
    rencana_tindak: input.rencana_tindak,
  });

  if (error) return { success: false, message: `Gagal menyimpan QA: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/qa-inspeksi");
  revalidatePath("/dashboard/peta");
  return { success: true, message: "Laporan QA & Inspeksi berhasil disimpan." };
}