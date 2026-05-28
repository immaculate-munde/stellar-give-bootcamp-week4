export function AuctionLifecycleGuide() {
  const steps = [
    {
      title: "1. Create & escrow",
      body: "Submit the form, approve XLM in your wallet, and your prize is locked in the smart contract. The auction appears in Browse Auctions immediately.",
    },
    {
      title: "2. Bidding opens",
      body: "Others place bids in XLM until the deadline. Outbid users are refunded automatically.",
    },
    {
      title: "3. After the deadline",
      body: "Anyone can finalize the auction. The winner receives the prize token; the seller receives the winning bid.",
    },
  ];

  const rules = [
    "You cannot edit title, image, or amounts after creation — listings are immutable on-chain.",
    "You can cancel only before the first bid. After that, the auction must run to completion.",
    "If no one bids, finalize after the deadline to recover your escrowed prize.",
  ];

  return (
    <div className="mb-10 space-y-6 border border-cyan/10 bg-navy-card/60 p-6 md:p-8">
      <div>
        <p className="section-label mb-3">How it works</p>
        <h2 className="font-serif text-2xl text-white md:text-3xl">
          After you create an auction
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="border border-cyan/10 bg-navy p-4"
          >
            <h3 className="text-sm uppercase tracking-[0.2em] text-cyan">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">{step.body}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
          Edit, cancel & delete
        </h3>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-white/70">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="text-cyan">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
