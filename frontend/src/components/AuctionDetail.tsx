"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AuctionView,
  cancelAuction,
  claimRefund,
  fetchPendingRefund,
  finalizeAuction,
  placeBid,
  TOKEN_DECIMALS,
} from "@/lib/auction";
import {
  auctionStatusLabel,
  formatTokenAmount,
  isAuctionLive,
  parseTokenAmount,
  shortenAddress,
} from "@/lib/utils";
import { formatError } from "@/lib/errors";
import { useWallet } from "@/lib/wallet";
import { CountdownTimer } from "./CountdownTimer";

export function AuctionDetailView({
  auction,
  onRefresh,
}: {
  auction: AuctionView;
  onRefresh: () => Promise<void>;
}) {
  const { address, connect, signAndSend } = useWallet();
  const [bidAmount, setBidAmount] = useState("");
  const [pendingRefund, setPendingRefund] = useState(0n);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const live = isAuctionLive(auction.status, auction.endTime);
  const ended =
    auction.status === 1 ||
    BigInt(Math.floor(Date.now() / 1000)) >= auction.endTime;
  const minNextBid =
    auction.highestBid > 0n ? auction.highestBid + 1n : auction.minBid;

  useEffect(() => {
    setBidAmount(formatTokenAmount(minNextBid));
  }, [auction.id, auction.highestBid, auction.minBid]);

  useEffect(() => {
    if (!address) return;
    fetchPendingRefund(auction.id, address)
      .then(setPendingRefund)
      .catch(() => setPendingRefund(0n));
  }, [address, auction.id, loading]);

  const runAction = async (label: string, action: (wallet: string) => Promise<unknown>) => {
    try {
      setLoading(label);
      setMessage(null);
      let wallet = address;
      if (!wallet) {
        wallet = await connect();
      }
      if (!wallet) {
        throw new Error("Connect your wallet to continue");
      }
      await action(wallet);
      setMessage(`${label} successful`);
      await onRefresh();
    } catch (error) {
      setMessage(formatError(error));
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
      <Link
        href="/auctions"
        className="text-xs uppercase tracking-[0.25em] text-cyan-muted transition hover:text-cyan"
      >
        ← Back to auctions
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative min-h-[520px] overflow-hidden border border-cyan/10 bg-navy-card">
          <Image
            src={
              auction.imageUrl ||
              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80"
            }
            alt={auction.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="section-label mb-4">{auctionStatusLabel(auction.status)}</p>
          <h1 className="font-serif text-4xl text-white md:text-5xl">
            {auction.title}
          </h1>
          <p className="mt-6 font-serif text-3xl text-cyan md:text-4xl">
            {formatTokenAmount(
              auction.highestBid > 0n ? auction.highestBid : auction.minBid,
            )}{" "}
            <span className="text-lg uppercase tracking-[0.2em] text-cyan-muted">
              current bid
            </span>
          </p>

          {auction.highestBidder && (
            <p className="mt-3 text-sm text-white/60">
              Highest bidder: {shortenAddress(auction.highestBidder, 6)}
            </p>
          )}

          <div className="mt-6">
            <CountdownTimer endTime={auction.endTime} />
          </div>

          <div className="mt-10 border-t border-cyan/10 pt-8">
            <h2 className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
              Description
            </h2>
            <p className="mt-4 leading-7 text-white/75">{auction.description}</p>
          </div>

          {address === auction.seller && auction.status === 0 && (
            <div className="mt-8 border border-cyan/15 bg-navy-card/80 p-5">
              <h2 className="text-xs uppercase tracking-[0.25em] text-cyan">
                Seller controls
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Listings cannot be edited after creation.{" "}
                {auction.bidCount === 0
                  ? "You can cancel below to recover your escrowed prize while no bids exist."
                  : "Bids have been placed, so this auction must run until the deadline and then be finalized."}
              </p>
            </div>
          )}

          {live && (
            <div className="mt-10 space-y-4">
              <label className="block text-xs uppercase tracking-[0.25em] text-cyan-muted">
                Your bid amount
              </label>
              <input
                type="number"
                min={Number(minNextBid) / 10 ** TOKEN_DECIMALS}
                step="0.0000001"
                value={bidAmount}
                onChange={(event) => setBidAmount(event.target.value)}
                className="w-full border border-cyan/20 bg-navy-card px-4 py-3 text-white outline-none transition focus:border-cyan"
              />
              <p className="text-xs text-cyan-muted">
                Minimum bid: {formatTokenAmount(minNextBid)} XLM
                {auction.highestBid > 0n ? " (must beat the current high bid)" : ""}
              </p>
              <button
                type="button"
                disabled={loading !== null}
                onClick={() => {
                  const amount = parseTokenAmount(bidAmount, TOKEN_DECIMALS);
                  if (amount <= 0n) {
                    setMessage("Enter a bid amount in XLM");
                    return;
                  }
                  if (amount < minNextBid) {
                    setMessage(
                      `Bid must be at least ${formatTokenAmount(minNextBid)} XLM`,
                    );
                    return;
                  }

                  runAction("Place bid", (wallet) =>
                    placeBid(
                      wallet,
                      auction.id,
                      amount,
                      auction.bidToken,
                      signAndSend,
                    ),
                  );
                }}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading === "Place bid" ? "Submitting..." : "Place Bid"}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {pendingRefund > 0n && (
              <button
                type="button"
                disabled={loading !== null}
                onClick={() =>
                  runAction("Claim refund", (wallet) =>
                    claimRefund(wallet, auction.id, signAndSend),
                  )
                }
                className="btn-ghost w-full disabled:opacity-60"
              >
                {loading === "Claim refund"
                  ? "Claiming..."
                  : `Claim Refund (${formatTokenAmount(pendingRefund)})`}
              </button>
            )}

            {ended && auction.status === 0 && (
              <button
                type="button"
                disabled={loading !== null}
                onClick={() =>
                  runAction("Finalize auction", (wallet) =>
                    finalizeAuction(wallet, auction.id, signAndSend),
                  )
                }
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading === "Finalize auction"
                  ? "Finalizing..."
                  : "Finalize Auction"}
              </button>
            )}

            {auction.status === 0 &&
              auction.bidCount === 0 &&
              address === auction.seller && (
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() =>
                    runAction("Cancel auction", (wallet) =>
                      cancelAuction(wallet, auction.id, signAndSend),
                    )
                  }
                  className="btn-ghost w-full disabled:opacity-60"
                >
                  {loading === "Cancel auction"
                    ? "Cancelling..."
                    : "Cancel Auction"}
                </button>
              )}
          </div>

          {message && (
            <p className="mt-6 text-sm text-cyan-muted" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
