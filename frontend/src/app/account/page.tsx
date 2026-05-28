"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import {
  fetchUserAuctionActivity,
  UserAuctionActivity,
} from "@/lib/userAuctions";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";

function ActivityBlock<T>({
  title,
  empty,
  items,
  renderItem,
}: {
  title: string;
  empty: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <section className="theme-panel border theme-border p-6 md:p-8">
      <h2 className="font-serif text-2xl theme-heading">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm theme-muted">{empty}</p>
      ) : (
        <div className="mt-6 space-y-3">{items.map((item) => renderItem(item))}</div>
      )}
    </section>
  );
}

export default function AccountPage() {
  const { address, connect, connecting } = useWallet();
  const [activity, setActivity] = useState<UserAuctionActivity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setActivity(null);
      return;
    }

    setLoading(true);
    fetchUserAuctionActivity(address)
      .then(setActivity)
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-10 text-center">
        <p className="section-label mb-4">Your account</p>
        <h1 className="heading-serif">My Auctions</h1>
        <p className="mx-auto mt-4 max-w-2xl theme-muted">
          No email sign-up required. Connect your Stellar wallet — that is your
          login. We read your listings, bids, wins, and refunds directly from
          the blockchain.
        </p>
      </div>

      {!address ? (
        <div className="theme-panel mx-auto max-w-lg border theme-border p-8 text-center">
          <p className="theme-muted">
            Connect Freighter, Albedo, xBull, LOBSTR, or another Stellar wallet
            to see your activity.
          </p>
          <button
            type="button"
            onClick={() => connect()}
            disabled={connecting}
            className="btn-primary mt-6 disabled:opacity-60"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-8 text-center text-sm theme-muted">
            Logged in as{" "}
            <span className="font-mono text-cyan">
              {shortenAddress(address, 8)}
            </span>
          </p>

          {loading && (
            <p className="mb-8 text-center theme-muted">
              Loading your activity...
            </p>
          )}

          {activity && (
            <div className="space-y-8">
              <ActivityBlock
                title="Items I listed"
                empty="You have not created any auctions yet."
                items={activity.created}
                renderItem={(auction) => (
                  <Link
                    key={auction.id}
                    href={`/auctions/${auction.id}`}
                    className="flex items-center justify-between border theme-border px-4 py-4 transition hover:border-cyan/40"
                  >
                    <span className="theme-heading">{auction.title}</span>
                    <span className="text-sm text-cyan">
                      {formatTokenAmount(
                        auction.highestBid > 0n
                          ? auction.highestBid
                          : auction.minBid,
                      )}{" "}
                      XLM
                    </span>
                  </Link>
                )}
              />

              <ActivityBlock
                title="My active bids"
                empty="You are not the highest bidder on any live auction."
                items={activity.activeBids}
                renderItem={(auction) => (
                  <Link
                    key={auction.id}
                    href={`/auctions/${auction.id}`}
                    className="flex items-center justify-between border theme-border px-4 py-4 transition hover:border-cyan/40"
                  >
                    <span className="theme-heading">{auction.title}</span>
                    <span className="text-sm text-cyan">
                      {formatTokenAmount(auction.highestBid)} XLM
                    </span>
                  </Link>
                )}
              />

              <ActivityBlock
                title="Items I won"
                empty="No finalized wins yet."
                items={activity.won}
                renderItem={(auction) => (
                  <Link
                    key={auction.id}
                    href={`/auctions/${auction.id}`}
                    className="flex items-center justify-between border theme-border px-4 py-4 transition hover:border-cyan/40"
                  >
                    <span className="theme-heading">{auction.title}</span>
                    <span className="text-sm text-cyan">Won</span>
                  </Link>
                )}
              />

              <ActivityBlock
                title="Pending refunds"
                empty="No refunds waiting to be claimed."
                items={activity.pendingRefunds}
                renderItem={({ auction, amount }) => (
                  <Link
                    key={auction.id}
                    href={`/auctions/${auction.id}`}
                    className="flex items-center justify-between border theme-border px-4 py-4 transition hover:border-cyan/40"
                  >
                    <span className="theme-heading">{auction.title}</span>
                    <span className="text-sm text-cyan">
                      Claim {formatTokenAmount(amount)} XLM
                    </span>
                  </Link>
                )}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
