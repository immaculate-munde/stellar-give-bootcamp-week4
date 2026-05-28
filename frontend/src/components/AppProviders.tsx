"use client";

import { ThemeProvider } from "@/lib/theme";
import { WalletProvider } from "@/lib/wallet";
import { ToastProvider } from "./Providers";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WalletProvider>
        <ToastProvider>{children}</ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
