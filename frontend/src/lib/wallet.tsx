"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import {
  KitEventType,
  Networks,
  SwkAppDarkTheme,
} from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE } from "./config";

type WalletContextValue = {
  address: string | null;
  walletName: string | null;
  connecting: boolean;
  connect: () => Promise<string | null>;
  openProfile: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSend: (xdr: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

let kitInitialized = false;

function initKit() {
  if (kitInitialized || typeof window === "undefined") return;
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
    theme: SwkAppDarkTheme,
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });
  kitInitialized = true;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    initKit();

    const unsubState = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        setAddress(event.payload.address ?? null);
      },
    );

    const unsubWallet = StellarWalletsKit.on(
      KitEventType.WALLET_SELECTED,
      (event) => {
        setWalletName(event.payload.id ?? null);
      },
    );

    const unsubDisconnect = StellarWalletsKit.on(
      KitEventType.DISCONNECT,
      () => {
        setAddress(null);
        setWalletName(null);
      },
    );

    StellarWalletsKit.getAddress()
      .then(({ address: connected }) => setAddress(connected))
      .catch(() => undefined);

    return () => {
      unsubState();
      unsubWallet();
      unsubDisconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    initKit();
    setConnecting(true);
    try {
      const { address: connected } = await StellarWalletsKit.authModal();
      setAddress(connected);
      return connected;
    } finally {
      setConnecting(false);
    }
  }, []);

  const openProfile = useCallback(async () => {
    initKit();
    await StellarWalletsKit.profileModal();
  }, []);

  const disconnect = useCallback(async () => {
    initKit();
    await StellarWalletsKit.disconnect();
    setAddress(null);
    setWalletName(null);
  }, []);

  const signAndSend = useCallback(
    async (xdr: string) => {
      initKit();
      const activeAddress =
        address ?? (await StellarWalletsKit.getAddress()).address;

      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: activeAddress,
      });

      return signedTxXdr;
    },
    [address],
  );

  const value = useMemo(
    () => ({
      address,
      walletName,
      connecting,
      connect,
      openProfile,
      disconnect,
      signAndSend,
    }),
    [
      address,
      walletName,
      connecting,
      connect,
      openProfile,
      disconnect,
      signAndSend,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
