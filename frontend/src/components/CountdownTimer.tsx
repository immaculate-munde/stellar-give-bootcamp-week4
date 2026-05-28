"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ endTime }: { endTime: bigint }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(endTime) - now;
      if (diff <= 0) {
        setRemaining("Auction ended");
        return;
      }
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <p className="font-sans text-sm uppercase tracking-[0.25em] text-cyan">
      {remaining}
    </p>
  );
}
