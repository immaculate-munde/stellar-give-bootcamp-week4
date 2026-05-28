"use client";

import Link from "next/link";
import Image from "next/image";
import { AuctionView } from "@/lib/auction";
import { formatTokenAmount, isAuctionLive } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";

const HERO_IMAGE = "/hero-auction.png";

export function HeroFeaturedAuction({
  auction,
}: {
  auction: AuctionView | null;
}) {
  const live = auction ? isAuctionLive(auction.status, auction.endTime) : false;
  const bid = auction
    ? auction.highestBid > 0n
      ? auction.highestBid
      : auction.minBid
    : 0n;

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="AuctionWithMe — bid with confidence"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 hero-overlay-r" />
      <div className="absolute inset-0 hero-overlay-t" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 py-24 lg:px-10">
        <div className="max-w-2xl animate-fade-up">
          {auction ? (
            <>
              <p className="section-label mb-6 drop-shadow-sm">
                {live ? "Featured Live Auction" : "Featured Auction"}
              </p>
              <h1 className="heading-serif drop-shadow-lg">{auction.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-7 theme-muted drop-shadow-md">
                {auction.description}
              </p>
              <div className="mt-8 space-y-3">
                <p className="font-serif text-3xl text-cyan drop-shadow-md">
                  {formatTokenAmount(bid)} XLM
                </p>
                <CountdownTimer endTime={auction.endTime} />
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href={`/auctions/${auction.id}`} className="btn-primary">
                  Get Started
                </Link>
                <Link href="/auctions" className="btn-ghost bg-navy/40 backdrop-blur-sm">
                  View All Auctions
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="section-label mb-6 drop-shadow-sm">
                No-Loss Auction Protocol
              </p>
              <h1 className="heading-serif drop-shadow-lg">
                Bid with confidence.
                <span className="block text-cyan">Never lose your stake.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 theme-muted drop-shadow-md">
                AuctionWithMe brings trusted auction experiences to Stellar.
                Outbid participants are refunded automatically — or claim
                manually anytime.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/auctions" className="btn-primary">
                  Get Started
                </Link>
                <Link href="/create" className="btn-ghost bg-navy/40 backdrop-blur-sm">
                  Create Auction
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
