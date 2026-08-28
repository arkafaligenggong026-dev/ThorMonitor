"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import type { WorkOrder } from "@/lib/types";

// 🔥 TAMBAHAN: Import Capacitor untuk File System & Share
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// 🔥 Fungsi pembantu untuk ngubah data mentah Excel jadi Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function ExportQaButton({ data }: { data: WorkOrder[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("QA & Inspeksi ROW");

      // Header dengan urutan spesifik
      worksheet.columns = [
        { header: "Minggu Ke", key: "minggu_ke", width: 15 },
        { header: "Inspektor", key: "inspektor", width: 20 },
        { header: "KMS", key: "kms", width: 15 },
        { header: "Rencana Tindak", key: "rencana_tindak", width: 30 },
        { header: "Nama Penyulang", key: "nama_penyulang", width: 25 },
        { header: "Urgensi", key: "urgensi", width: 15 },
        { header: "Koordinat (Lat, Lng)", key: "koordinat", width: 30 },
        { header: "Foto Sebelum", key: "foto_before", width: 25 }, // Kolom H (Index 7)
        { header: "Tgl Tindak Lanjut", key: "tgl_tindak", width: 20 },
        { header: "Foto Sesudah", key: "foto_after", width: 25 },  // Kolom J (Index 9)
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0091B5" } };
      worksheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).height = 30;

      for (let i = 0; i < data.length; i++) {
        const qa = data[i];
        const rowNumber = i + 2;

        const row = worksheet.addRow({
          minggu_ke: qa.minggu_ke,
          inspektor: qa.inspektor || "-",
          kms: qa.kms || "-",
          rencana_tindak: qa.rencana_tindak || "-",
          nama_penyulang: qa.nama_penyulang,
          urgensi: qa.urgensi,
          koordinat: `${qa.latitude}, ${qa.longitude}`,
          // Ambil tanggal verifikasi (closed_at) atau penyelesaian (resolved_at)
          tgl_tindak: qa.closed_at ? new Date(qa.closed_at).toLocaleString("id-ID") : (qa.resolved_at ? new Date(qa.resolved_at).toLocaleString("id-ID") : "Belum Selesai"),
        });

        row.height = 100;
        row.alignment = { vertical: "middle", horizontal: "center" };

        // Helper function untuk download & embed gambar
        const embedImage = async (url: string, colIndex: number) => {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const imageId = workbook.addImage({ buffer: arrayBuffer, extension: "png" });
            worksheet.addImage(imageId, {
              tl: { col: colIndex, row: rowNumber - 1 },
              ext: { width: 120, height: 120 },
            });
          } catch (err) {
            worksheet.getCell(rowNumber, colIndex + 1).value = "Gagal memuat foto";
          }
        };

        // Pasang Foto Before (Kolom H - index 7)
        if (qa.foto_before_url) {
          await embedImage(qa.foto_before_url, 7);
        } else {
          worksheet.getCell(`H${rowNumber}`).value = "Tidak ada foto";
        }

        // Pasang Foto After (Kolom J - index 9)
        if (qa.foto_after_url) {
          await embedImage(qa.foto_after_url, 9);
        } else {
          worksheet.getCell(`J${rowNumber}`).value = "Tidak ada foto";
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Laporan_QA_ROW_${dateStr}.xlsx`;

      // 🔥 LOGIKA HYBRID CAPACITOR VS WEB
      if (Capacitor.isNativePlatform()) {
        // 📱 Skenario HP Android (APK)
        const base64Data = arrayBufferToBase64(buffer as ArrayBuffer);
        
        // Simpan ke Cache HP
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        // Buka Pop-up Share/Buka File Android
        await Share.share({
          title: fileName,
          url: savedFile.uri,
          dialogTitle: 'Buka atau Bagikan Laporan QA',
        });

      } else {
        // 💻 Skenario Web/Laptop Biasa
        const fileBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
      console.error("Gagal export excel QA:", error);
      alert("Terjadi kesalahan saat mengekspor Excel QA.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      variant="outline" 
      className="flex items-center gap-2 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white transition-all shadow-sm"
    >
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {isExporting ? "Mengekspor QA..." : "Export QA (Excel)"}
    </Button>
  );
}