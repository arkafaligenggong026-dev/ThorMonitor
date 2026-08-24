import type { Role, Urgensi, WoStatus } from "./types";

export const APP_NAME = "ThorMonitor";
export const APP_DESCRIPTION =
  "Sistem Manajemen Work Order Terintegrasi Berbasis Geotagging — PT PLN (Persero)";

export const KATEGORI_WO = [
  "Temuan Trafo",
  "Temuan Tiang",
  "Temuan Kabel/JTM",
  "Temuan Gardu",
  "Pohon Tumbang",
  "Lainnya",
] as const;

export const URGENSI_OPTIONS: { value: Urgensi; label: string }[] = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
  { value: "kritis", label: "Kritis" },
];

export const URGENSI_LABEL: Record<Urgensi, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
  kritis: "Kritis",
};

export const URGENSI_COLOR: Record<Urgensi, string> = {
  rendah: "bg-slate-100 text-slate-700 border-slate-200",
  sedang: "bg-blue-50 text-blue-700 border-blue-200",
  tinggi: "bg-orange-50 text-orange-700 border-orange-200",
  kritis: "bg-red-50 text-red-700 border-red-200",
};

export const STATUS_LABEL: Record<WoStatus, string> = {
  open: "Menunggu",
  assigned: "Ditugaskan",
  in_progress: "Dikerjakan",
  resolved: "Selesai (Verifikasi)",
  closed: "Ditutup",
};

export const STATUS_BADGE_CLASS: Record<WoStatus, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-300",
  assigned: "bg-accent-50 text-accent-800 border-accent-300",
  in_progress: "bg-orange-50 text-orange-700 border-orange-300",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-300",
  closed: "bg-teal-50 text-teal-700 border-teal-300",
};

// Warna solid dipakai untuk pin marker di peta (FR-3.2)
export const STATUS_MARKER_COLOR: Record<WoStatus, string> = {
  open: "#64748B",
  assigned: "#FBB910",
  in_progress: "#F97316",
  resolved: "#22C55E",
  closed: "#0D9488",
};

export const ROLE_LABEL = {
  tim_inspeksi: "Tim Inspeksi",
  supervisor: "Pegawai",           // <-- Sudah diubah
  tim_pemeliharaan: "Tim Eksekusi" // <-- Sudah diubah
};

export const ROLE_OPTIONS: { value: Role; label: string; deskripsi: string }[] = [
  {
    value: "tim_inspeksi",
    label: "Tim Inspeksi",
    deskripsi: "Melakukan inspeksi & melaporkan temuan di lapangan",
  },
  {
    value: "supervisor",
    label: "Pegawai",
    deskripsi: "Meninjau laporan, menugaskan tim eksekusi, dan verifikasi",
  },
  {
    value: "tim_pemeliharaan",
    label: "Tim Eksekusi",
    deskripsi: "Mengerjakan perbaikan di lokasi inspeksi",
  },
];