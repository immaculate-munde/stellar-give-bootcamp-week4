"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Can I auction anything — cars, jewelry, books?",
    answer:
      "Yes. You can list any item by adding a title, description, and photo when you create an auction. Cars, jewelry, books, collectibles, and more are all welcome. The smart contract escrows a SEP-41 token as the prize; your listing metadata describes what the winner receives. Delivery of physical items is arranged off-chain between buyer and seller after the auction is finalized.",
  },
  {
    question: "What is a no-loss auction?",
    answer:
      "In a no-loss auction, your bid is held in the contract — not lost forever if someone outbids you. When a higher bid is placed, the previous highest bidder is refunded automatically. If an automatic refund ever fails, you can claim your refund manually from the auction page.",
  },
  {
    question: "Which wallets are supported?",
    answer:
      "AuctionWithMe supports multiple Stellar wallets through Stellar Wallets Kit. Click Connect Wallet to choose from Freighter, Albedo, xBull, Rabet, LOBSTR, Hana, and others. MetaMask is not supported because this app runs on Stellar, not Ethereum.",
  },
  {
    question: "Is MetaMask supported?",
    answer:
      "No. MetaMask is for Ethereum and EVM chains. AuctionWithMe uses Stellar Soroban smart contracts. Connect with a Stellar wallet such as Freighter, Albedo, or xBull from the wallet picker in the header.",
  },
  {
    question: "Do I need to sign up with email or a password?",
    answer:
      "No. AuctionWithMe has no traditional accounts. Connect your Stellar wallet — that is your login. Visit My Account to see items you listed, active bids, won auctions, and any pending refunds tied to your wallet address on-chain.",
  },
  {
    question: "Can I edit or delete an auction after creating it?",
    answer:
      "You cannot edit an auction after it is created — the title, image, description, and prize amount are locked on-chain and cannot be changed. However, you can delete (cancel) your auction if no one has placed a bid yet. Go to the auction detail page and use Cancel Auction to recover your escrowed prize. Once the first bid is placed, deletion is no longer possible and the auction must run until the deadline.",
  },
  {
    question: "What happens after I create an auction?",
    answer:
      "Your prize XLM is escrowed in the contract and the auction goes live immediately. Bidders compete until the deadline. If you are outbid as a bidder you are refunded automatically. After the deadline, anyone can finalize: the winner gets the prize and the seller gets the winning bid. If there were no bids, finalize returns the prize to the seller.",
  },
  {
    question: "What tokens do I need to bid or create an auction?",
    answer:
      "Bids and prize escrow use XLM on Stellar testnet. When creating an auction you can enter prize and minimum bid values in KES, USD, EUR, GBP, NGN, or XLM — the form converts your amount to the equivalent XLM before escrow. Your wallet will ask you to approve the contract before tokens are transferred.",
  },
  {
    question: "Can I cancel an auction after creating it?",
    answer:
      "Yes, but only before anyone bids. If no bids have been placed, you can delete the listing from its detail page using Cancel Auction — your escrowed prize is returned to your wallet. After the first bid, the auction cannot be deleted and must continue until the deadline, then be finalized.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t theme-border theme-bg">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-12 text-center">
          <p className="section-label mb-4">Questions</p>
          <h2 className="font-serif text-4xl theme-heading md:text-5xl">
            Frequently Asked
          </h2>
          <p className="mx-auto mt-4 max-w-2xl theme-muted">
            Everything you need to know before listing or bidding on
            AuctionWithMe.
          </p>
        </div>

        <div className="divide-y theme-border border theme-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left transition hover:bg-cyan/5 md:px-8"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg theme-heading md:text-xl">
                    {faq.question}
                  </span>
                  <span
                    className={`mt-1 shrink-0 text-cyan transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 md:px-8">
                    <p className="leading-7 theme-muted">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
