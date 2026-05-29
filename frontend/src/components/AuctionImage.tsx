"use client";

import { useEffect, useState } from "react";

/** Neutral placeholder — not a real listing photo, so users don't think it's the wrong item. */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  showUnavailableLabel?: boolean;
};

export function AuctionImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
  showUnavailableLabel = true,
}: Props) {
  const trimmed = src?.trim() || "";
  const [currentSrc, setCurrentSrc] = useState(trimmed || FALLBACK_IMAGE);
  const [unavailable, setUnavailable] = useState(!trimmed);

  useEffect(() => {
    if (trimmed) {
      setCurrentSrc(trimmed);
      setUnavailable(false);
    } else {
      setCurrentSrc(FALLBACK_IMAGE);
      setUnavailable(true);
    }
  }, [trimmed]);

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (currentSrc !== FALLBACK_IMAGE) {
            setCurrentSrc(FALLBACK_IMAGE);
            setUnavailable(true);
          }
        }}
      />
      {showUnavailableLabel && unavailable && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/90">
            Image unavailable
          </p>
          <p className="mt-1 text-[11px] leading-5 text-white/70">
            The hosted link expired or broke. The item photo was not replaced —
            re-list with upload or a permanent URL.
          </p>
        </div>
      )}
    </div>
  );
}

export { FALLBACK_IMAGE };
