"use client";

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
      <span className="section-label block">Item image</span>

      {displayUrl && (
        <div className="relative mt-3 h-48 w-full overflow-hidden border border-theme theme-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Auction preview"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div
        className="theme-panel-box mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-10 transition hover:border-accent"
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
        <p className="text-sm theme-text">
          {uploading ? "Uploading..." : "Click to upload an image"}
        </p>
        <p className="mt-2 text-xs text-subtle">PNG, JPG, WEBP up to 4MB</p>
        <p className="mt-2 text-center text-xs text-subtle">
          Uploads are stored permanently when Vercel Blob is configured.
        </p>
      </div>

      <label className="block">
        <span className="section-label block">
          Or paste image URL
        </span>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
          placeholder="https://example.com/your-item.jpg"
          className="theme-input mt-3 w-full"
        />
        <p className="mt-2 text-xs text-subtle">
          Use a permanent direct link (.jpg, .png, .webp). Temporary hosts
          like tmpfiles.org will stop working.
        </p>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
