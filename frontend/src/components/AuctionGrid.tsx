import { AuctionView } from "@/lib/auction";
import { formatTokenAmount, isAuctionLive } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function StatsBar({ auctions }: { auctions: AuctionView[] }) {
  const active = auctions.filter((auction) =>
    isAuctionLive(auction.status, auction.endTime),
  ).length;
  const totalVolume = auctions.reduce(
    (sum, auction) => sum + auction.highestBid,
    0n,
  );

  const stats = [
    { label: "Active Auctions", value: String(active) },
    { label: "Total Listed", value: String(auctions.length) },
    { label: "Total Volume", value: formatTokenAmount(totalVolume) },
  ];

  return (
    <section className="border-y border-cyan/10 bg-navy-deep">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3 lg:px-10">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="font-display text-3xl text-cyan md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AuctionCard({
  auction,
  featured = false,
}: {
  auction: AuctionView;
  featured?: boolean;
}) {
  const live = isAuctionLive(auction.status, auction.endTime);
  const bidLabel =
    auction.highestBid > 0n
      ? formatTokenAmount(auction.highestBid)
      : formatTokenAmount(auction.minBid);

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={`group relative block overflow-hidden bg-navy-card ${
        featured ? "min-h-[520px]" : "min-h-[320px]"
      }`}
    >
      <Image
        src={auction.imageUrl || "/placeholder-auction.jpg"}
        alt={auction.title}
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes={featured ? "50vw" : "33vw"}
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="section-label mb-3">{live ? "Live" : "Closed"}</p>
        <h3
          className={`font-serif text-white ${
            featured ? "text-3xl md:text-4xl" : "text-2xl"
          }`}
        >
          {auction.title}
        </h3>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-cyan">
          Current bid · {bidLabel}
        </p>
      </div>
    </Link>
  );
}

export function AuctionGrid({ auctions }: { auctions: AuctionView[] }) {
  if (auctions.length === 0) {
    return (
      <div className="rounded border border-dashed border-cyan/20 px-8 py-20 text-center">
        <p className="font-serif text-3xl text-white">No auctions yet</p>
        <p className="mt-4 text-cyan-muted">
          Be the first to list a prize on the no-loss protocol.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = auctions;

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
      <div className="lg:col-span-7 lg:row-span-2">
        <AuctionCard auction={featured} featured />
      </div>
      {rest.slice(0, 2).map((auction) => (
        <div key={auction.id} className="lg:col-span-5">
          <AuctionCard auction={auction} />
        </div>
      ))}
      {rest.slice(2).map((auction) => (
        <div key={auction.id} className="lg:col-span-4">
          <AuctionCard auction={auction} />
        </div>
      ))}
    </div>
  );
}
