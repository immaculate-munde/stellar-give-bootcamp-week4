"use client";

import { HeroFeaturedAuction } from "@/components/HeroFeaturedAuction";
import { AuctionGrid, StatsBar } from "@/components/AuctionGrid";
import { FaqSection } from "@/components/FaqSection";
import { useAuctions } from "@/hooks/useAuctions";
import Link from "next/link";
import { isAuctionLive } from "@/lib/utils";

export default function HomePage() {
  const { auctions, loading } = useAuctions();
  const featured =
    auctions.find((auction) => isAuctionLive(auction.status, auction.endTime)) ??
    auctions[0] ??
    null;

  return (
    <>
      <HeroFeaturedAuction auction={featured} />
      <StatsBar auctions={auctions} />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label mb-4">Active Listings</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              Trending Auctions
            </h2>
          </div>
          <Link
            href="/auctions"
            className="text-xs uppercase tracking-[0.25em] text-cyan transition hover:text-cyan-bright"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-cyan-muted">Loading auctions...</p>
        ) : (
          <AuctionGrid auctions={auctions.slice(0, 5)} />
        )}
      </section>

      <FaqSection />
    </>
  );
}
