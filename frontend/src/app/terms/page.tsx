import { LegalLayout } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | AuctionWithMe",
  description: "Terms of service for AuctionWithMe no-loss auction platform.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="May 28, 2026">
      <section>
        <h2 className="font-serif text-2xl text-white">1. Acceptance of terms</h2>
        <p>
          By accessing or using AuctionWithMe, you agree to these Terms of
          Service. If you do not agree, do not use the platform.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">2. Description of service</h2>
        <p>
          AuctionWithMe provides a web interface to interact with a no-loss
          auction smart contract deployed on the Stellar network. The platform
          enables users to create auctions, place bids using SEP-41 tokens, receive
          refunds when outbid, and finalize or cancel auctions according to
          on-chain rules.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">3. Non-custodial nature</h2>
        <p>
          AuctionWithMe does not custody your funds or private keys. You are
          solely responsible for your wallet, approvals, and transaction
          confirmations. All blockchain transactions are irreversible once
          confirmed.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">4. Eligibility</h2>
        <p>
          You must be at least 18 years old and legally permitted to use
          blockchain services in your jurisdiction. You are responsible for
          compliance with local laws regarding digital assets and auctions.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">5. Auction listings and items</h2>
        <p>
          Sellers may list items such as cars, jewelry, books, collectibles, or
          other goods by providing descriptive metadata and escrowing a SEP-41
          token as the on-chain prize. AuctionWithMe does not verify the
          authenticity, legality, or condition of listed items.
        </p>
        <p className="mt-4">
          Delivery of physical or off-chain items is arranged directly between
          buyer and seller after auction finalization. The smart contract governs
          token escrow only.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">6. Bidding and refunds</h2>
        <p>
          Bids are placed in SEP-41 tokens and held by the smart contract.
          Outbid participants are refunded automatically when a higher bid is
          placed, with a manual claim option available as a fallback. AuctionWithMe
          is not liable for failed transactions caused by network congestion,
          wallet errors, or insufficient token approvals.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">7. Prohibited conduct</h2>
        <p>You agree not to:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>List illegal, stolen, or fraudulent items</li>
          <li>Manipulate auctions through wash trading or collusion</li>
          <li>Attempt to exploit smart contract or interface vulnerabilities</li>
          <li>Use the platform in violation of applicable law</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">8. Disclaimers</h2>
        <p>
          The platform and smart contract are provided &quot;as is&quot; without
          warranties of any kind. We do not guarantee uninterrupted access,
          accurate pricing data, or successful transaction execution. Testnet
          deployments are for demonstration and testing purposes.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">9. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, AuctionWithMe and its
          contributors shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the platform, including
          loss of tokens or failed off-chain deliveries.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">10. Changes to terms</h2>
        <p>
          We may modify these Terms of Service at any time. Updated terms will be
          posted on this page with a revised date. Your continued use constitutes
          acceptance.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">11. Contact</h2>
        <p>
          For questions about these terms, contact{" "}
          <a href="mailto:legal@auctionwithme.app" className="text-cyan hover:underline">
            legal@auctionwithme.app
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
