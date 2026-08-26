"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserPlus,
  PlayCircle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PhotoUpload } from "./photo-upload";
import {
  assignWorkOrder,
  startWorkOrder,
  resolveWorkOrder,
  verifyWorkOrder,
} from "@/lib/actions/work-orders";
import type { ActionResult, Profile, Role, WorkOrder, WoStatus } from "@/lib/types";

// PERBAIKAN: Mengubah kata "Tim Pemeliharaan" menjadi "Tim Eksekutor" agar masuk akal untuk semua tim
const PESAN_STATUS: Record<WoStatus, string> = {
  open: "Menunggu ditugaskan oleh Pegawai.",
  assigned: "Sudah ditugaskan, menunggu Tim Eksekutor memulai pekerjaan.",
  in_progress: "Sedang dikerjakan oleh Tim Eksekutor.",
  resolved: "Menunggu verifikasi hasil kerja oleh Supervisor.",
  closed: "Work Order telah diverifikasi dan ditutup.",
};

export function WoDetailActions({
  wo,
  currentUserId,
  currentUserRole,
  // Prop ini tetap pakai nama lama agar tidak error dengan page.tsx, tapi isinya sudah dinamis (bisa Rabas/Pemeliharaan)
  timPemeliharaanOptions: opsiEksekutor, 
}: {
  wo: WorkOrder;
  currentUserId: string;
  currentUserRole: Role;
  timPemeliharaanOptions: Profile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTeknisi, setSelectedTeknisi] = useState(opsiEksekutor[0]?.id ?? "");

  const [resolveOpen, setResolveOpen] = useState(false);
  const [fotoAfter, setFotoAfter] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [catatan, setCatatan] = useState("");

  function jalankan(aksi: () => Promise<ActionResult>, onSukses?: () => void) {
    setError(null);
    startTransition(async () => {
      const hasil = await aksi();
      if (!hasil.success) {
        setError(hasil.message ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      onSukses?.();
      router.refresh();
    });
  }

  const errorBox = error ? (
    <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">{error}</p>
  ) : null;

  // LOGIKA DINAMIS: Cek apakah ini WO tipe ROW atau bukan
  const isRow = wo.kategori === "ROW";
  const labelTim = isRow ? "Tim Rabas (Khusus ROW)" : "Tim Pemeliharaan";
  const labelPendek = isRow ? "Tim Rabas" : "Tim Pemeliharaan";

  // LOGIKA DINAMIS: Cek apakah user yang login ini orang lapangan (bisa rabas/pemeliharaan)
  const isEksekutorLapangan = ["tim_pemeliharaan", "tim_rabas", "tim_pdkb"].includes(currentUserRole);

  // --- Supervisor: tugaskan WO berstatus "open" ---
  if (currentUserRole === "supervisor" && wo.status === "open") {
    return (
      <div className="space-y-3">
        {errorBox}
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button 
              className={`w-full h-12 text-base font-bold text-white rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                isRow 
                  ? "bg-[#0091B5] hover:bg-[#007A99] shadow-[#0091B5]/30" 
                  : "bg-[#FE8200] hover:bg-[#E07300] shadow-[#FE8200]/30"
              }`}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Tugaskan ke {labelTim}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tugaskan Work Order</DialogTitle>
              <DialogDescription>
                Pilih anggota {labelPendek} untuk menangani {wo.nomor_wo}.
              </DialogDescription>
            </DialogHeader>
            {opsiEksekutor.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
                Belum ada akun dengan peran <strong>{labelPendek}</strong> yang terdaftar.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Pilih Anggota {labelPendek}</Label>
                  <Select
                    value={selectedTeknisi}
                    onChange={(e) => setSelectedTeknisi(e.target.value)}
                    className="mt-1"
                  >
                    {opsiEksekutor.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} ({p.nip})
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  className="w-full h-11 font-bold bg-[#0091B5] hover:bg-[#007A99]"
                  disabled={isPending}
                  onClick={() =>
                    jalankan(
                      () => assignWorkOrder(wo.id, selectedTeknisi),
                      () => setAssignOpen(false)
                    )
                  }
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Konfirmasi Penugasan
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Tim Eksekutor (Rabas/Pemeliharaan): mulai kerjakan WO yang ditugaskan ---
  if (
    isEksekutorLapangan &&
    wo.status === "assigned" &&
    wo.ditugaskan_ke === currentUserId
  ) {
    return (
      <div className="space-y-3">
        {errorBox}
        <Button
          className="w-full h-12 text-base font-bold bg-[#0091B5] hover:bg-[#007A99] text-white rounded-xl shadow-[0_4px_15px_rgba(0,145,181,0.3)] transition-all active:scale-[0.98]"
          disabled={isPending}
          onClick={() => jalankan(() => startWorkOrder(wo.id))}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 h-5 w-5" />
          )}
          Mulai Kerjakan
        </Button>
      </div>
    );
  }

  // --- Tim Eksekutor (Rabas/Pemeliharaan): selesaikan WO yang sedang dikerjakan ---
  if (
    isEksekutorLapangan &&
    wo.status === "in_progress" &&
    wo.ditugaskan_ke === currentUserId
  ) {
    return (
      <div className="space-y-3">
        {errorBox}
        {wo.catatan_revisi && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            <p className="mb-1 font-semibold">Catatan Revisi dari Supervisor:</p>
            <p>{wo.catatan_revisi}</p>
          </div>
        )}
        <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 text-base font-bold text-white rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]" variant="success">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Selesaikan Pekerjaan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selesaikan Pekerjaan</DialogTitle>
              <DialogDescription>
                Unggah foto hasil kerja (After) untuk {wo.nomor_wo}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <PhotoUpload
                label="Foto Hasil Kerja (After)"
                folder="after"
                value={fotoAfter}
                onChange={setFotoAfter}
              />
              <Button
                className="w-full h-11 font-bold"
                variant="success"
                disabled={isPending || !fotoAfter}
                onClick={() =>
                  jalankan(
                    () => resolveWorkOrder(wo.id, fotoAfter as string),
                    () => setResolveOpen(false)
                  )
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim & Selesaikan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Supervisor: verifikasi WO yang sudah "resolved" ---
  if (currentUserRole === "supervisor" && wo.status === "resolved") {
    return (
      <div className="space-y-3">
        {errorBox}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            className="h-11 font-bold shadow-md"
            disabled={isPending}
            onClick={() => jalankan(() => verifyWorkOrder(wo.id, true))}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="mr-2 h-4 w-4" />
            )}
            Setujui & Tutup
          </Button>
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="h-11 font-bold shadow-md">
                <ThumbsDown className="mr-2 h-4 w-4" />
                Tolak / Revisi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tolak & Minta Revisi</DialogTitle>
                <DialogDescription>
                  Jelaskan bagian yang belum sesuai standar operasional untuk {wo.nomor_wo}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Contoh: pemotongan dahan belum bersih, mohon diperbaiki ulang."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  variant="destructive"
                  className="w-full h-11 font-bold"
                  disabled={isPending || !catatan.trim()}
                  onClick={() =>
                    jalankan(
                      () => verifyWorkOrder(wo.id, false, catatan.trim()),
                      () => setRejectOpen(false)
                    )
                  }
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Revisi
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // --- Tidak ada aksi untuk kombinasi peran/status ini ---
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-center text-sm font-medium text-slate-500 shadow-inner">
      {PESAN_STATUS[wo.status]}
    </div>
  );
}