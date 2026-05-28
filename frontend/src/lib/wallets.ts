import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import {
  WalletConnectModule,
  WalletConnectTargetChain,
} from "@creit.tech/stellar-wallets-kit/modules/wallet-connect";
import { isMobileBrowser } from "./device";

type WalletModule = ReturnType<typeof defaultModules>[number];

const MOBILE_WALLET_ORDER = [
  "wallet_connect",
  "albedo",
  "xbull",
  "freighter",
  "lobstr",
];

function sortForMobile(modules: WalletModule[]): WalletModule[] {
  return [...modules].sort((a, b) => {
    const aIndex = MOBILE_WALLET_ORDER.indexOf(a.productId);
    const bIndex = MOBILE_WALLET_ORDER.indexOf(b.productId);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function buildWalletModules(): WalletModule[] {
  const modules: WalletModule[] = [...defaultModules()];

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
  if (projectId) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://auction-with-me.vercel.app";

    modules.unshift(
      new WalletConnectModule({
        projectId,
        metadata: {
          name: "AuctionWithMe",
          description: "No-loss auctions on Stellar",
          url: origin,
          icons: [`${origin}/favicon.ico`],
        },
        allowedChains: [WalletConnectTargetChain.TESTNET],
      }),
    );
  }

  return isMobileBrowser() ? sortForMobile(modules) : modules;
}

export function walletModalOptions() {
  const mobile = isMobileBrowser();

  return {
    showInstallLabel: !mobile,
    hideUnsupportedWallets: mobile,
  };
}
