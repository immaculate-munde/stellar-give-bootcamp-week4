"use client";

import { useWallet } from "@/lib/wallet";
import { shortenAddress } from "@/lib/utils";

export function WalletButton({ className = "" }: { className?: string }) {
  const { address, walletName, connecting, connect, openProfile } = useWallet();

  if (address) {
    return (
      <button
        type="button"
        onClick={() => openProfile()}
        className={`btn-ghost min-w-[160px] ${className}`}
        title={walletName ? `Connected via ${walletName}` : "Wallet connected"}
      >
        {shortenAddress(address, 5)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect()}
      disabled={connecting}
      className={`btn-ghost min-w-[160px] disabled:opacity-60 ${className}`}
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
