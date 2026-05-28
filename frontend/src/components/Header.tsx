"use client";

import Link from "next/link";
import { useState } from "react";
import { WalletButton } from "./WalletButton";
import { ThemeToggle } from "./ThemeToggle";

const leftNav = [
  { href: "/auctions", label: "Auctions" },
  { href: "/create", label: "Create" },
  { href: "/account", label: "My Account" },
  { href: "/#faq", label: "FAQ" },
];

const rightNav = [{ href: "/auctions", label: "Browse" }];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b theme-header backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <nav className="hidden flex-1 items-center gap-8 lg:flex">
          {leftNav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="group text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-cyan transition group-hover:text-cyan-bright md:text-3xl">
            AuctionWithMe
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.45em] text-cyan-muted">
            No-Loss Auctions
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-4 lg:flex">
          {rightNav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <WalletButton />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border theme-border text-cyan"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            <span className="text-xl">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t theme-border px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {[...leftNav, ...rightNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link text-sm"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <WalletButton className="w-full" />
          </nav>
        </div>
      )}
    </header>
  );
}
