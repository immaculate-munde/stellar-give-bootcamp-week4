"use client";

import { WalletProvider } from "@/lib/wallet";
import { ToastProvider } from "./Providers";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <ToastProvider>{children}</ToastProvider>
    </WalletProvider>
  );
}
