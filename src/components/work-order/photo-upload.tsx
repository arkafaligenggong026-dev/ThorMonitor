"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, RotateCcw, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  label: string;
  folder: string; // path prefix di bucket, mis. "before" atau "after"
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

/**
 * FR-2.3 / FR-2.5: capture foto (idealnya langsung dari kamera perangkat)
 * lalu unggah ke Supabase Storage bucket "wo-photos". URL publik hasil
 * unggahan dikembalikan lewat onChange, untuk dikirim ke Server Action
 * bersama data laporan.
 */
export function PhotoUpload({ label, folder, value, onChange, disabled }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user?.id ?? "anon"}/${folder}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("wo-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Gagal mengunggah foto. Coba lagi.");
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("wo-photos").getPublicUrl(path);
      onChange(publicUrlData.publicUrl);
    } catch {
      setError("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image src={value} alt={label} fill className="object-cover" sizes="100vw" />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Ambil Ulang
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-primary hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Mengunggah...</span>
            </>
          ) : (
            <>
              <Camera className="h-6 w-6" />
              <span className="text-sm font-medium">Ambil / Unggah Foto</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <ImageOff className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
