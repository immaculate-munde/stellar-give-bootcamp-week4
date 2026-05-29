"use client";

import { AuctionGrid } from "@/components/AuctionGrid";
import { useAuctions } from "@/hooks/useAuctions";

export default function AuctionsPage() {
  const { auctions, loading, error } = useAuctions();

  return (
    <section className="page-section mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="page-section-header mb-12 text-center">
        <p className="section-label mb-4">Our Collections</p>
        <h1 className="heading-serif">Find Your Perfect Bid</h1>
      </div>

      {loading && <p className="text-center text-subtle">Loading auctions...</p>}
      {error && <p className="text-center text-red-300">{error}</p>}
      {!loading && !error && <AuctionGrid auctions={auctions} />}
    </section>
  );
}
