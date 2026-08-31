"use client";

import { useState } from "react";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// 🔥 IMPORT CAPACITOR UNTUK NANGANIN SAVE/SHARE DI HP
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface BeforeAfterProps {
  before: string | null;
  after: string | null;
}

// Fungsi pengubah data gambar ke format Base64 untuk memori HP
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  const [downloading, setDownloading] = useState<"before" | "after" | null>(null);

  const handleDownload = async (imageUrl: string, type: "before" | "after") => {
    setDownloading(type);
    try {
      // 1. Tarik gambar dari server (Supabase)
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Foto_${type.toUpperCase()}_WO_${dateStr}.png`;

      // 2. LOGIKA HYBRID
      if (Capacitor.isNativePlatform()) {
        // 📱 SKENARIO HP ANDROID (APK)
        const base64Data = arrayBufferToBase64(arrayBuffer);
        
        // Tulis foto ke memori Cache HP
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache, 
        });

        // Buka Pop-up Share/Save asli Android
        await Share.share({
          title: fileName,
          url: savedFile.uri,
          dialogTitle: `Simpan atau Bagikan Foto ${type.toUpperCase()}`,
        });

      } else {
        // 💻 SKENARIO BROWSER / LAPTOP
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName; // Download sebagai .png
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error(`Gagal mendownload foto ${type}:`, error);
      alert("Terjadi kesalahan saat mengunduh gambar. Pastikan koneksi stabil.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
      
      {/* --- BAGIAN KONDISI AWAL (BEFORE) --- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-rose-100 p-1.5 text-rose-600">
            <ImageIcon className="h-4 w-4" />
          </div>
          <p className="text-sm font-bold text-slate-700">Kondisi Awal (Before)</p>
        </div>
        
        {before ? (
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <img 
              src={before} 
              alt="Kondisi Before" 
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <ImageIcon className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-xs font-medium">Belum ada foto</p>
          </div>
        )}

        <Button
          onClick={() => before && handleDownload(before, "before")}
          disabled={!before || downloading === "before"}
          variant="outline"
          className="w-full font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
        >
          {downloading === "before" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {downloading === "before" ? "Memproses..." : "Download PNG"}
        </Button>
      </div>

      {/* --- BAGIAN HASIL KERJA (AFTER) --- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
            <ImageIcon className="h-4 w-4" />
          </div>
          <p className="text-sm font-bold text-slate-700">Hasil Kerja (After)</p>
        </div>
        
        {after ? (
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <img 
              src={after} 
              alt="Kondisi After" 
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <ImageIcon className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-xs font-medium">Belum ada foto</p>
          </div>
        )}

        <Button
          onClick={() => after && handleDownload(after, "after")}
          disabled={!after || downloading === "after"}
          variant="outline"
          className="w-full font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          {downloading === "after" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {downloading === "after" ? "Memproses..." : "Download PNG"}
        </Button>
      </div>

    </div>
  );
}