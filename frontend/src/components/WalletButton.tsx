"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { isMobileBrowser } from "@/lib/device";
import { shortenAddress } from "@/lib/utils";

export function WalletButton({ className = "" }: { className?: string }) {
  const { address, walletName, connecting, connect, openProfile } = useWallet();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileBrowser());
  }, []);

  const walletHint = mobile ? (
    <p className="mt-2 text-[11px] leading-5 text-cyan-muted">
      On mobile, use <strong className="text-white/80">WalletConnect</strong> for
      Freighter, or choose <strong className="text-white/80">Albedo</strong> /{" "}
      <strong className="text-white/80">xBull</strong>. Browser extensions are
      desktop-only.
    </p>
  ) : null;

  if (address) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => openProfile()}
          className="btn-ghost min-w-[160px] w-full"
          title={walletName ? `Connected via ${walletName}` : "Wallet connected"}
        >
          {shortenAddress(address, 5)}
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => connect()}
        disabled={connecting}
        className="btn-ghost min-w-[160px] w-full disabled:opacity-60"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {walletHint}
    </div>
  );
}
