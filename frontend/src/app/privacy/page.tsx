import { LegalLayout } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AuctionWithMe",
  description: "Privacy policy for AuctionWithMe no-loss auction platform.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="May 28, 2026">
      <section>
        <h2 className="font-serif text-2xl text-white">1. Introduction</h2>
        <p>
          AuctionWithMe (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates a
          decentralized auction interface built on the Stellar blockchain. This
          Privacy Policy explains how we handle information when you use our
          website and connect your wallet.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">2. Information we collect</h2>
        <p>
          AuctionWithMe is a non-custodial application. We do not require account
          registration or collect personal details such as your name, email, or
          phone number to use the service.
        </p>
        <p className="mt-4">
          When you connect a wallet, your public Stellar address becomes visible
          to the application so you can create auctions, place bids, and sign
          transactions. Blockchain activity associated with your address is public
          by nature and permanently recorded on the Stellar network.
        </p>
        <p className="mt-4">
          We may collect standard technical data such as browser type, device
          information, and pages visited to improve site performance and security.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">3. How we use information</h2>
        <p>We use available information to:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>Display auction listings and your wallet-connected actions</li>
          <li>Submit signed transactions to the Stellar network</li>
          <li>Maintain, secure, and improve the platform</li>
          <li>Respond to support requests if you contact us</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">4. Wallet providers</h2>
        <p>
          If you use Freighter or another third-party wallet, that provider&apos;s
          own privacy policy applies to how they handle your keys and personal
          data. We never receive or store your private keys.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">5. Cookies and local storage</h2>
        <p>
          We may use minimal browser storage to remember preferences or wallet
          connection state. You can clear this data at any time through your
          browser settings.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">6. Data retention</h2>
        <p>
          On-chain data cannot be deleted once submitted to the blockchain.
          Off-chain logs and analytics, if collected, are retained only as long
          as needed for operational purposes.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">7. Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct,
          or request deletion of personal data we hold off-chain. Contact us to
          make a request. We cannot alter data already published on the
          blockchain.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">8. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of
          AuctionWithMe after changes are posted constitutes acceptance of the
          revised policy.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-white">9. Contact</h2>
        <p>
          For privacy-related questions, contact us at{" "}
          <a href="mailto:privacy@auctionwithme.app" className="text-cyan hover:underline">
            privacy@auctionwithme.app
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
