// Tipe data inti ThorMonitor. Nama field sengaja disamakan persis dengan
// nama kolom di database (snake_case) supaya hasil query Supabase bisa
// dipakai langsung tanpa mapping tambahan.

export type Role = "tim_inspeksi" | "supervisor" | "tim_pemeliharaan";

export type WoStatus = "open" | "assigned" | "in_progress" | "resolved" | "closed";

// Tipe Urgensi diubah sesuai standar PLN
export type Urgensi = "mendesak" | "prioritas_1" | "prioritas_2";

export interface Profile {
  id: string;
  nip: string;
  nama_lengkap: string;
  role: Role;
  ulp: string | null; // <-- Tambahkan baris ini
  created_at: string;
}

export interface WorkOrder {
  id: string;
  nomor_wo: string;
  nama_penyulang: string;
  deskripsi: string;
  kategori: string;
  urgensi: Urgensi;
  status: WoStatus;
  latitude: number;
  longitude: number;
  alamat: string | null;
  foto_before_url: string;
  foto_after_url: string | null;
  catatan_revisi: string | null;
  dibuat_oleh: string;
  ditugaskan_ke: string | null;
  ditugaskan_oleh: string | null;
  created_at: string;
  assigned_at: string | null;
  started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  updated_at: string;
  
  // Kolom Tambahan Khusus QA & Inspeksi ROW
  minggu_ke: number | null;
  inspektor: string | null;
  kms: string | null;
  rencana_tindak: string | null;
}

export interface DashboardStats {
  total: number;
  open: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface ActionResult {
  success: boolean;
  message?: string;
}