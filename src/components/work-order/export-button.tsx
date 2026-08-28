"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";

// 🔥 TAMBAHAN: Import Capacitor untuk nangani File System & Share di HP
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface WoData {
  id: string;
  kategori: string;
  nama_penyulang: string;
  urgensi: string;
  latitude: number;
  longitude: number;
  foto_after_url: string | null;
  closed_at: string | null;
}

// Fungsi pembantu untuk ngubah data mentah (Buffer) jadi Base64 (Syarat wajib Capacitor)
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function ExportButton({ data }: { data: WoData[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan WO");

      // 1. Definisikan Header Kolom & Lebarnya
      worksheet.columns = [
        { header: "ID Laporan", key: "id", width: 20 },
        { header: "Tanggal Selesai", key: "closed_at", width: 20 },
        { header: "Jenis Gangguan", key: "kategori", width: 25 },
        { header: "Penyulang", key: "nama_penyulang", width: 25 },
        { header: "Urgensi", key: "urgensi", width: 15 },
        { header: "Latitude", key: "latitude", width: 15 },
        { header: "Longitude", key: "longitude", width: 15 },
        { header: "Foto Hasil (After)", key: "foto", width: 25 },
      ];

      // Percantik Header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).height = 30;

      // 2. Masukkan data ke baris satu per satu
      for (let i = 0; i < data.length; i++) {
        const wo = data[i];
        const rowNumber = i + 2; 

        const row = worksheet.addRow({
          id: wo.id,
          closed_at: wo.closed_at ? new Date(wo.closed_at).toLocaleString("id-ID") : "-",
          kategori: wo.kategori,
          nama_penyulang: wo.nama_penyulang,
          urgensi: wo.urgensi,
          latitude: wo.latitude,
          longitude: wo.longitude,
        });

        row.height = 100;
        row.alignment = { vertical: "middle", horizontal: "center" };

        // 3. Tarik foto dari URL dan tempelkan
        if (wo.foto_after_url) {
          try {
            const response = await fetch(wo.foto_after_url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            const imageId = workbook.addImage({
              buffer: arrayBuffer,
              extension: "png",
            });

            worksheet.addImage(imageId, {
              tl: { col: 7, row: rowNumber - 1 },
              ext: { width: 120, height: 120 },
            });
          } catch (err) {
            console.error("Gagal memuat foto untuk", wo.id, err);
            worksheet.getCell(`H${rowNumber}`).value = "Gagal memuat foto";
          }
        } else {
          worksheet.getCell(`H${rowNumber}`).value = "Tidak ada foto";
        }
      }

      // 4. Generate Data Mentah Excel-nya
      const buffer = await workbook.xlsx.writeBuffer();
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Laporan_WO_PLN_${dateStr}.xlsx`;

      // 🔥 5. LOGIKA HYBRID: Cek Platform
      if (Capacitor.isNativePlatform()) {
        // 📱 Skenario HP Android (APK)
        const base64Data = arrayBufferToBase64(buffer as ArrayBuffer);
        
        // Tulis file ke memori Cache HP
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache, // Taruh di Cache biar gampang di-Share
        });

        // Langsung panggil pop-up Share/Buka asli bawaan Android!
        await Share.share({
          title: fileName,
          url: savedFile.uri,
          dialogTitle: 'Buka atau Bagikan Laporan Excel',
        });
        
      } else {
        // 💻 Skenario Browser / Laptop Biasa
        const fileBlob = new Blob([buffer], { 
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });

        const url = URL.createObjectURL(fileBlob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error("Gagal export excel:", error);
      alert("Terjadi kesalahan saat mengekspor Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      variant="outline" 
      className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
    >
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {isExporting ? "Mengekspor..." : "Export Excel"}
    </Button>
  );
}