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
  { value: "mendesak", label: "Mendesak" },
  { value: "prioritas_1", label: "Prioritas 1" },
  { value: "prioritas_2", label: "Prioritas 2" },
];

export const URGENSI_LABEL: Record<Urgensi, string> = {
  mendesak: "Mendesak",
  prioritas_1: "Prioritas 1",
  prioritas_2: "Prioritas 2",
};

export const URGENSI_COLOR: Record<Urgensi, string> = {
  mendesak: "bg-red-50 text-red-700 border-red-200",
  prioritas_1: "bg-orange-50 text-orange-700 border-orange-200",
  prioritas_2: "bg-blue-50 text-blue-700 border-blue-200",
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

export const STATUS_MARKER_COLOR: Record<WoStatus, string> = {
  open: "#64748B",
  assigned: "#FBB910",
  in_progress: "#F97316",
  resolved: "#22C55E",
  closed: "#0D9488",
};

// --- BAGIAN ROLE ---

export const ROLE_LABEL: Record<Role, string> = {
  tim_inspeksi: "Tim Inspeksi",
  supervisor: "Pegawai (Kantor)",
  tim_rabas: "Tim Rabas (ROW)",
  tim_pemeliharaan: "Tim Pemeliharaan",
  tim_pdkb: "Tim PDKB (Elit)"
};

export const ROLE_OPTIONS: { value: Role; label: string; deskripsi: string }[] = [
  { value: "tim_inspeksi", label: "Tim Inspeksi", deskripsi: "Patroli & laporkan anomali jaringan" },
  { value: "supervisor", label: "Pegawai (Kantor)", deskripsi: "Verifikasi laporan QA & tugaskan WO" },
  { value: "tim_rabas", label: "Tim Rabas (ROW)", deskripsi: "Yantek Khusus: Pemotongan Pohon" },
  { value: "tim_pemeliharaan", label: "Tim Pemeliharaan", deskripsi: "Yantek Khusus: Konstruksi, Tiang, Gardu & Trafo" },
  { value: "tim_pdkb", label: "Tim PDKB", deskripsi: "" },
];

// Helper array untuk mengecek apakah user adalah bagian dari Tim Eksekusi
export const EKSEKUSI_ROLES: Role[] = ["tim_rabas", "tim_pemeliharaan", "tim_pdkb"];