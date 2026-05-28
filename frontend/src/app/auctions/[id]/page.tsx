"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuctionDetailView } from "@/components/AuctionDetail";
import { AuctionView, fetchAuction } from "@/lib/auction";

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const auctionId = Number(params.id);
  const [auction, setAuction] = useState<AuctionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!auctionId) return;
    try {
      setError(null);
      const data = await fetchAuction(auctionId);
      setAuction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load auction");
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <p className="px-6 py-20 text-center text-cyan-muted lg:px-10">
        Loading auction...
      </p>
    );
  }

  if (error || !auction) {
    return (
      <p className="px-6 py-20 text-center text-red-300 lg:px-10">
        {error ?? "Auction not found"}
      </p>
    );
  }

  return <AuctionDetailView auction={auction} onRefresh={refresh} />;
}
