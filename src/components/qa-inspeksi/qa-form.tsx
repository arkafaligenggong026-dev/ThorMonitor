"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2, AlertCircle, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/work-order/photo-upload";
import { URGENSI_OPTIONS } from "@/lib/constants";
import { reverseGeocode } from "@/lib/utils";
import { createQaInspeksi } from "@/lib/actions/work-orders";
import type { Urgensi } from "@/lib/types";

const INSPEKTOR_OPTIONS = ["MULP", "TL Teknik"];

export function QaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State Khusus QA
  const [mingguKe, setMingguKe] = useState("");
  const [inspektor, setInspektor] = useState(INSPEKTOR_OPTIONS[0]);
  const [kms, setKms] = useState("");
  const [rencanaTindak, setRencanaTindak] = useState(""); // Sekarang ini akan menyimpan format tanggal (YYYY-MM-DD)
  
  // State Bawaan
  const [namaPenyulang, setNamaPenyulang] = useState("");
  const [urgensi, setUrgensi] = useState<Urgensi>(URGENSI_OPTIONS[0].value);
  const [fotoBefore, setFotoBefore] = useState<string | null>(null);

  const [lokasi, setLokasi] = useState<{ lat: number; lng: number } | null>(null);
  const [alamat, setAlamat] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function ambilLokasi() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError("Perangkat/browser ini tidak mendukung GPS.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokasi({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude).then(setAlamat);
      },
      () => {
        setLocError("Gagal mengambil lokasi. Pastikan GPS diaktifkan.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const mKe = parseInt(mingguKe);

    if (!mKe || !inspektor || !kms.trim() || !rencanaTindak || !namaPenyulang.trim() || !urgensi) {
      setError("Mohon lengkapi seluruh kolom QA.");
      return;
    }
    if (!lokasi) {
      setError("Mohon ambil titik koordinat terlebih dahulu.");
      return;
    }
    if (!fotoBefore) {
      setError("Mohon unggah foto kondisi awal (Before).");
      return;
    }

    startTransition(async () => {
      const result = await createQaInspeksi({
        minggu_ke: mKe,
        inspektor,
        kms: kms.trim(),
        rencana_tindak: rencanaTindak, // Tanggal yang dikirim
        nama_penyulang: namaPenyulang.trim(),
        urgensi,
        latitude: lokasi.lat,
        longitude: lokasi.lng,
        alamat,
        foto_before_url: fotoBefore,
      });

      if (!result.success) {
        setError(result.message ?? "Gagal menyimpan QA.");
        return;
      }
      router.push("/dashboard/qa-inspeksi");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      
      {/* Header Form ROW */}
      <div className="mb-2 border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-[#0091B5]">Right of Way (ROW)</h2>
      </div>

      {/* 1. Kolom Minggu Ke- */}
      <div className="space-y-1.5">
        <Label htmlFor="mingguKe" className="text-slate-700 font-semibold">Minggu Ke-</Label>
        <Input
          id="mingguKe"
          type="number"
          min="1"
          placeholder="Contoh: 1, 2, 3..."
          value={mingguKe}
          onChange={(e) => setMingguKe(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        />
      </div>

      {/* 2. Inspektor */}
      <div className="space-y-1.5">
        <Label htmlFor="inspektor" className="text-slate-700 font-semibold">Inspektor</Label>
        <Select
          id="inspektor"
          value={inspektor}
          onChange={(e) => setInspektor(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        >
          {INSPEKTOR_OPTIONS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </Select>
      </div>

      {/* 3. KMS */}
      <div className="space-y-1.5">
        <Label htmlFor="kms" className="text-slate-700 font-semibold">KMS</Label>
        <Input
          id="kms"
          placeholder="Masukkan nilai KMS..."
          value={kms}
          onChange={(e) => setKms(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        />
      </div>

      {/* 4. Rencana Tindak (Diubah jadi Kalender) */}
      <div className="space-y-1.5">
        <Label htmlFor="rencanaTindak" className="text-slate-700 font-semibold">Tanggal Rencana Tindak</Label>
        <Input
          id="rencanaTindak"
          type="date"
          value={rencanaTindak}
          onChange={(e) => setRencanaTindak(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        />
      </div>

      {/* 5. Nama Penyulang & Section */}
      <div className="space-y-1.5">
        <Label htmlFor="penyulang" className="text-slate-700 font-semibold">Nama Penyulang dan Section</Label>
        <Input
          id="penyulang"
          placeholder="Contoh: PU2 Section 3"
          value={namaPenyulang}
          onChange={(e) => setNamaPenyulang(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        />
      </div>

      {/* 6. Urgensi */}
      <div className="space-y-1.5">
        <Label htmlFor="urgensi" className="text-slate-700 font-semibold">Urgensi</Label>
        <Select
          id="urgensi"
          value={urgensi}
          onChange={(e) => setUrgensi(e.target.value as Urgensi)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        >
          {URGENSI_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </Select>
      </div>

      {/* 7. Titik Koordinat */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-semibold">Titik Koordinat (Geotagging)</Label>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-all">
          {lokasi ? (
            <div className="mb-3 flex items-start gap-2.5 text-sm text-slate-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0091B5]/10">
                <MapPin className="h-4 w-4 text-[#0091B5]" />
              </div>
              <div>
                <p className="font-mono text-xs font-semibold tracking-wider text-slate-500">
                  {lokasi.lat.toFixed(6)}, {lokasi.lng.toFixed(6)}
                </p>
                {alamat && <p className="mt-1 text-sm font-medium">{alamat}</p>}
              </div>
            </div>
          ) : (
            <p className="mb-3 text-sm font-medium text-slate-500">Lokasi belum diambil.</p>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={ambilLokasi}
            disabled={locating || isPending}
            className="w-full sm:w-auto border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0091B5]"
          >
            {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0091B5]" /> : <LocateFixed className="mr-2 h-4 w-4 text-[#0091B5]" />}
            {lokasi ? "Perbarui Lokasi" : "Ambil Lokasi Saat Ini"}
          </Button>
          {locError && <p className="mt-3 text-xs font-medium text-red-600">{locError}</p>}
        </div>
      </div>

      {/* 8. Foto Before */}
      <div className="pt-2">
        <PhotoUpload
          label="Foto Kondisi Awal (Before)"
          folder="qa_before"
          value={fotoBefore}
          onChange={setFotoBefore}
          disabled={isPending}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tombol Kirim */}
      <div className="pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full border-0 bg-gradient-to-r from-[#FE8200] to-[#CE0900] font-bold text-white shadow-md transition-all hover:shadow-lg hover:shadow-[#FE8200]/30 active:scale-[0.98]" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isPending ? "Mengirim Laporan..." : "Kirim Laporan"}
        </Button>
      </div>
    </form>
  );
}