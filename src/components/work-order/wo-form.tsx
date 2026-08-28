"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2, AlertCircle, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "./photo-upload";
import { URGENSI_OPTIONS } from "@/lib/constants";
import { reverseGeocode } from "@/lib/utils";
import { createWorkOrder } from "@/lib/actions/work-orders";
import type { Urgensi } from "@/lib/types";

// 🔥 TAMBAHAN: Import Capacitor untuk sensor GPS Native di HP
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Opsi pilihan disesuaikan dengan bahasa Inspeksi
const JENIS_INSPEKSI_OPTIONS = [
  "Inspeksi Konstruksi",
  "ROW (Right of Way)",
  "Inspeksi Gardu"
];

export function WoForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [jenisInspeksi, setJenisInspeksi] = useState<string>(JENIS_INSPEKSI_OPTIONS[0]);
  const [namaPenyulang, setNamaPenyulang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urgensi, setUrgensi] = useState<Urgensi>(URGENSI_OPTIONS[0].value);
  const [fotoBefore, setFotoBefore] = useState<string | null>(null);

  const [lokasi, setLokasi] = useState<{ lat: number; lng: number } | null>(null);
  const [alamat, setAlamat] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // 🔥 FUNGSI GPS HYBRID (SUPPORT CAPACITOR & BROWSER)
  async function ambilLokasi() {
    setLocating(true);
    setLocError(null);

    try {
      let lat: number;
      let lng: number;

      if (Capacitor.isNativePlatform()) {
        // 📱 BERJALAN DI APLIKASI ANDROID (APK)
        const check = await Geolocation.checkPermissions();
        if (check.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error("Izin lokasi ditolak oleh pengguna.");
          }
        }
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } else {
        // 💻 BERJALAN DI BROWSER / LAPTOP
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          throw new Error("Perangkat/browser ini tidak mendukung GPS.");
        }
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 15000 
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      setLokasi({ lat, lng });
      
      // Ambil teks alamat dari koordinat
      const alamatResult = await reverseGeocode(lat, lng);
      setAlamat(alamatResult);

    } catch (err: any) {
      console.error("Gagal mengambil lokasi:", err);
      setLocError(err.message || "Gagal mengambil lokasi. Pastikan GPS diaktifkan.");
    } finally {
      setLocating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!jenisInspeksi || !namaPenyulang.trim() || !deskripsi.trim() || !urgensi) {
      setError("Mohon lengkapi semua kolom formulir.");
      return;
    }
    if (!lokasi) {
      setError("Mohon ambil titik koordinat lokasi inspeksi terlebih dahulu.");
      return;
    }
    if (!fotoBefore) {
      setError("Mohon unggah foto kondisi awal (Before).");
      return;
    }

    startTransition(async () => {
      const result = await createWorkOrder({
        jenis_gangguan: jenisInspeksi, // Key DB dipertahankan agar tidak error, valuenya dari jenisInspeksi
        nama_penyulang: namaPenyulang.trim(),
        deskripsi: deskripsi.trim(),
        urgensi,
        latitude: lokasi.lat,
        longitude: lokasi.lng,
        alamat,
        foto_before_url: fotoBefore,
      });

      if (!result.success) {
        setError(result.message ?? "Gagal menyimpan laporan.");
        return;
      }

      router.push("/dashboard/work-orders");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      
      <div className="space-y-1.5">
        <Label htmlFor="jenisInspeksi" className="text-slate-700 font-semibold">Jenis Inspeksi</Label>
        <Select
          id="jenisInspeksi"
          value={jenisInspeksi}
          onChange={(e) => setJenisInspeksi(e.target.value)}
          disabled={isPending}
          className="bg-slate-50 transition-colors focus:bg-white"
        >
          {JENIS_INSPEKSI_OPTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </Select>
      </div>

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

      <div className="space-y-1.5">
        <Label htmlFor="deskripsi" className="text-slate-700 font-semibold">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          placeholder="Jelaskan kondisi temuan inspeksi di lapangan..."
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          disabled={isPending}
          className="min-h-[100px] bg-slate-50 transition-colors focus:bg-white resize-y"
        />
      </div>

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
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </Select>
      </div>

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
            {locating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0091B5]" />
            ) : (
              <LocateFixed className="mr-2 h-4 w-4 text-[#0091B5]" />
            )}
            {lokasi ? "Perbarui Lokasi" : "Ambil Lokasi Saat Ini"}
          </Button>
          {locError && <p className="mt-3 text-xs font-medium text-red-600">{locError}</p>}
        </div>
      </div>

      <div className="pt-2">
        <PhotoUpload
          label="Foto Kondisi Awal (Before)"
          folder="before"
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

      <div className="pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full border-0 bg-gradient-to-r from-[#0091B5] to-[#1E3A8A] font-bold text-white shadow-md transition-all hover:shadow-lg hover:shadow-[#0091B5]/30 active:scale-[0.98]" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isPending ? "Mengirim Laporan..." : "Kirim Laporan"}
        </Button>
      </div>
    </form>
  );
}