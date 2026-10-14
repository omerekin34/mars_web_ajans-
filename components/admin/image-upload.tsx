"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { inputClass } from "./primitives";
import { isHttpUrl } from "@/lib/admin/format";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  folder?: string;
  hint?: string;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "https://",
  autoFocus = false,
  folder = "general",
  hint,
  error,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview = value?.trim() && isHttpUrl(value.trim()) ? value.trim() : null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Yükleme başarısız");
      }

      onChange(data.url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Yükleme başarısız";
      // Bucket not found veya RLS hatası için özel mesaj
      if (errorMsg.includes("Bucket not found") || errorMsg.includes("row-level security")) {
        setUploadError("Storage ayarları eksik. Supabase SQL Editor'da setup-storage.sql dosyasını çalıştırın.");
      } else {
        setUploadError(errorMsg);
      }
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            value={value}
            autoFocus={autoFocus}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            placeholder={placeholder}
            inputMode="url"
          />
        </div>
        <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/70">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- Önizleme rastgele dış adresten gelir.
            <img src={preview} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-4 w-4 text-slate-600" aria-hidden />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-slate-200 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden />
              Bilgisayardan seç
            </>
          )}
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-400/50 hover:text-rose-200"
          >
            <X className="h-4 w-4" aria-hidden />
            Temizle
          </button>
        )}
      </div>

      {uploadError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
          <p className="text-xs text-rose-200">{uploadError}</p>
        </div>
      )}

      {hint && !uploadError && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-rose-300">{error}</p>
      )}
    </div>
  );
}
