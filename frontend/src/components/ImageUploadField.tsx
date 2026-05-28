"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

type Props = {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
};

export function ImageUploadField({ imageUrl, onImageUrlChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview || imageUrl;

  const handleFile = async (file: File | null) => {
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const url = await uploadImage(file);
      onImageUrlChange(url);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
        Item image
      </span>

      {displayUrl && (
        <div className="relative mt-3 h-48 w-full overflow-hidden border border-cyan/20 bg-navy">
          <Image
            src={displayUrl}
            alt="Auction preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div
        className="mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed border-cyan/30 bg-navy px-6 py-10 transition hover:border-cyan/60 hover:bg-navy-card/50"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        <p className="text-sm text-white/80">
          {uploading ? "Uploading..." : "Click to upload an image"}
        </p>
        <p className="mt-2 text-xs text-cyan-muted">PNG, JPG, WEBP up to 4MB</p>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
          Or paste image URL
        </span>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
          placeholder="https://example.com/your-item.jpg"
          className="mt-3 w-full border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
        />
      </label>

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
