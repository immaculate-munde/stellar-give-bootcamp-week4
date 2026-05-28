"use client";

import { useCallback, useEffect, useState } from "react";
import { AuctionView, fetchAuctions } from "@/lib/auction";

export function useAuctions(pollMs = 5000) {
  const [auctions, setAuctions] = useState<AuctionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAuctions();
      setAuctions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollMs);
    return () => clearInterval(interval);
  }, [refresh, pollMs]);

  return { auctions, loading, error, refresh };
}
