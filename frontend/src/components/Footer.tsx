import Link from "next/link";
import { CONTRACT_ID } from "@/lib/config";
import { shortenAddress } from "@/lib/utils";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Browse Auctions" },
  { href: "/create", label: "Create Auction" },
  { href: "/account", label: "My Account" },
  { href: "/#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const resourceLinks = [
  {
    href: "https://developers.stellar.org/docs/build/smart-contracts/overview",
    label: "Stellar Docs",
    external: true,
  },
  {
    href: "https://www.freighter.app/",
    label: "Get Freighter Wallet",
    external: true,
  },
  {
    href: "https://lab.stellar.org/r/testnet/contract/" + CONTRACT_ID,
    label: "View Contract",
    external: true,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t theme-border theme-bg">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-bold text-cyan">
                AuctionWithMe
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 theme-muted">
              No-loss auctions on Stellar. Bid with confidence — outbid
              participants are refunded automatically.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-cyan-muted">
              Network: Testnet
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-cyan">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm theme-muted transition hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-cyan">
              Legal
            </h3>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm theme-muted transition hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-cyan">
              Resources
            </h3>
            <ul className="mt-5 space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm theme-muted transition hover:text-cyan"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t theme-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs theme-muted">
              © {year} AuctionWithMe. All rights reserved.
            </p>
            <p className="text-xs theme-muted">
              An{" "}
              <a
                href="https://mundeimmaculate.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan transition hover:text-cyan-bright hover:underline"
              >
                Immaculate Munde
              </a>{" "}
              Creation
            </p>
          </div>
          <p className="text-xs theme-muted">
            Contract:{" "}
            <span className="font-mono text-cyan-muted">
              {shortenAddress(CONTRACT_ID, 8)}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
