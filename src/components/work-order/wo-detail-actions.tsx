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

const PESAN_STATUS: Record<WoStatus, string> = {
  open: "Menunggu ditugaskan oleh Supervisor.",
  assigned: "Sudah ditugaskan, menunggu Tim Pemeliharaan memulai pekerjaan.",
  in_progress: "Sedang dikerjakan oleh Tim Pemeliharaan.",
  resolved: "Menunggu verifikasi hasil kerja oleh Supervisor.",
  closed: "Work Order telah diverifikasi dan ditutup.",
};

export function WoDetailActions({
  wo,
  currentUserId,
  currentUserRole,
  timPemeliharaanOptions,
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
  const [selectedTeknisi, setSelectedTeknisi] = useState(timPemeliharaanOptions[0]?.id ?? "");

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

  // --- Supervisor: tugaskan WO berstatus "open" (FR-2.4) ---
  if (currentUserRole === "supervisor" && wo.status === "open") {
    return (
      <div className="space-y-3">
        {errorBox}
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <UserPlus className="h-4 w-4" />
              Tugaskan ke Tim Pemeliharaan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tugaskan Work Order</DialogTitle>
              <DialogDescription>
                Pilih anggota Tim Pemeliharaan untuk menangani {wo.nomor_wo}.
              </DialogDescription>
            </DialogHeader>
            {timPemeliharaanOptions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada akun dengan peran Tim Pemeliharaan yang terdaftar.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Anggota Tim Pemeliharaan</Label>
                  <Select
                    value={selectedTeknisi}
                    onChange={(e) => setSelectedTeknisi(e.target.value)}
                  >
                    {timPemeliharaanOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} ({p.nip})
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={isPending}
                  onClick={() =>
                    jalankan(
                      () => assignWorkOrder(wo.id, selectedTeknisi),
                      () => setAssignOpen(false)
                    )
                  }
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Konfirmasi Penugasan
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Tim Pemeliharaan: mulai kerjakan WO yang ditugaskan ---
  if (
    currentUserRole === "tim_pemeliharaan" &&
    wo.status === "assigned" &&
    wo.ditugaskan_ke === currentUserId
  ) {
    return (
      <div className="space-y-3">
        {errorBox}
        <Button
          className="w-full"
          size="lg"
          disabled={isPending}
          onClick={() => jalankan(() => startWorkOrder(wo.id))}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Mulai Kerjakan
        </Button>
      </div>
    );
  }

  // --- Tim Pemeliharaan: selesaikan WO yang sedang dikerjakan (FR-2.5) ---
  if (
    currentUserRole === "tim_pemeliharaan" &&
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
            <Button className="w-full" size="lg" variant="success">
              <CheckCircle2 className="h-4 w-4" />
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
                className="w-full"
                variant="success"
                disabled={isPending || !fotoAfter}
                onClick={() =>
                  jalankan(
                    () => resolveWorkOrder(wo.id, fotoAfter as string),
                    () => setResolveOpen(false)
                  )
                }
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
            disabled={isPending}
            onClick={() => jalankan(() => verifyWorkOrder(wo.id, true))}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            Setujui &amp; Tutup
          </Button>
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <ThumbsDown className="h-4 w-4" />
                Tolak / Revisi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tolak &amp; Minta Revisi</DialogTitle>
                <DialogDescription>
                  Jelaskan bagian yang belum sesuai standar operasional untuk {wo.nomor_wo}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Contoh: sambungan kabel belum rapi, mohon diperbaiki ulang."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isPending || !catatan.trim()}
                  onClick={() =>
                    jalankan(
                      () => verifyWorkOrder(wo.id, false, catatan.trim()),
                      () => setRejectOpen(false)
                    )
                  }
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {PESAN_STATUS[wo.status]}
    </div>
  );
}
