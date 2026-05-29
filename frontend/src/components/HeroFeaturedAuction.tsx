"use client";

import Link from "next/link";
import Image from "next/image";
import { AuctionView } from "@/lib/auction";
import { formatTokenAmount, isAuctionLive } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";

const HERO_IMAGE = "/hero-auction.png";

export function MarketingHero() {
  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="AuctionWithMe — bid with confidence"
        fill
        priority
        className="hero-image object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 hero-overlay-scrim" aria-hidden />
      <div className="absolute inset-0 hero-overlay-r" aria-hidden />
      <div className="absolute inset-0 hero-overlay-t" aria-hidden />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 py-24 lg:px-10">
        <div className="hero-copy max-w-2xl animate-fade-up">
          <p className="section-label mb-6">
            No-Loss Auction Protocol
          </p>
          <h1 className="heading-serif">
            Bid with confidence.
            <span className="hero-accent block">Never lose your stake.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 theme-muted">
            AuctionWithMe brings trusted auction experiences to Stellar. Outbid
            participants are refunded automatically — or claim manually anytime.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/auctions" className="btn-primary">
              Browse Auctions
            </Link>
            <Link href="/create" className="btn-ghost hero-ghost-btn backdrop-blur-sm">
              Create Auction
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedAuctionBanner({
  auction,
}: {
  auction: AuctionView | null;
}) {
  if (!auction) return null;

  const live = isAuctionLive(auction.status, auction.endTime);
  const bid =
    auction.highestBid > 0n ? auction.highestBid : auction.minBid;
  const bidLabel =
    auction.highestBid > 0n ? "Current bid" : "Opening bid from";

  return (
    <section className="border-y border-theme theme-panel-box">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="section-label mb-3">
            {live ? "Featured live auction" : "Featured auction"}
          </p>
          <h2 className="font-serif text-2xl theme-heading md:text-3xl">
            {auction.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-subtle">
            {auction.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="text-right sm:text-left">
            <p className="section-label">
              {bidLabel}
            </p>
            <p className="mt-1 font-serif text-2xl text-accent">
              {formatTokenAmount(bid)} XLM
            </p>
            <div className="mt-2">
              <CountdownTimer endTime={auction.endTime} />
            </div>
          </div>
          <Link href={`/auctions/${auction.id}`} className="btn-primary shrink-0">
            View & Bid
          </Link>
        </div>
      </div>
    </section>
  );
}
