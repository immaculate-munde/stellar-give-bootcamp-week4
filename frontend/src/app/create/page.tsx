"use client";

import { useEffect, useMemo, useState } from "react";
import { CurrencyAmountField } from "@/components/CurrencyAmountField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { createAuction, TOKEN_DECIMALS } from "@/lib/auction";
import { BID_TOKEN, PRIZE_TOKEN } from "@/lib/config";
import {
  convertLocalToXlm,
  fetchXlmRates,
  FiatCurrency,
} from "@/lib/currency";
import { parseTokenAmount } from "@/lib/utils";
import { useWallet } from "@/lib/wallet";

export default function CreateAuctionPage() {
  const { address, connect, signAndSend } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [rates, setRates] = useState<Partial<Record<FiatCurrency, number>>>({
    XLM: 1,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    prizeAmount: "10000",
    prizeCurrency: "KES" as FiatCurrency,
    minBidAmount: "1000",
    minBidCurrency: "KES" as FiatCurrency,
    durationHours: "24",
  });

  useEffect(() => {
    fetchXlmRates()
      .then(setRates)
      .catch(() => setMessage("Could not load live exchange rates. Try XLM directly."))
      .finally(() => setRatesLoading(false));
  }, []);

  const prizeXlm = useMemo(
    () => convertLocalToXlm(form.prizeAmount, form.prizeCurrency, rates),
    [form.prizeAmount, form.prizeCurrency, rates],
  );

  const minBidXlm = useMemo(
    () => convertLocalToXlm(form.minBidAmount, form.minBidCurrency, rates),
    [form.minBidAmount, form.minBidCurrency, rates],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.imageUrl.trim()) {
      setMessage("Please upload an image or provide an image URL");
      return;
    }

    if (prizeXlm === null || minBidXlm === null) {
      setMessage("Enter valid prize and minimum bid amounts");
      return;
    }

    if (minBidXlm >= prizeXlm) {
      setMessage("Minimum bid must be lower than the prize amount in XLM");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      let seller = address;
      if (!seller) {
        seller = await connect();
      }
      if (!seller) {
        throw new Error("Connect your wallet to create an auction");
      }

      const endTime =
        Math.floor(Date.now() / 1000) +
        Number(form.durationHours) * 60 * 60;

      await createAuction(
        {
          seller,
          bidToken: BID_TOKEN,
          prizeToken: PRIZE_TOKEN,
          prizeAmount: parseTokenAmount(
            prizeXlm.toFixed(TOKEN_DECIMALS),
            TOKEN_DECIMALS,
          ),
          minBid: parseTokenAmount(
            minBidXlm.toFixed(TOKEN_DECIMALS),
            TOKEN_DECIMALS,
          ),
          endTime,
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl,
        },
        signAndSend,
      );

      setMessage("Auction created successfully");
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        imageUrl: "",
        prizeAmount: "10000",
        minBidAmount: "1000",
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <div className="mb-12 text-center">
        <p className="section-label mb-4">List a prize</p>
        <h1 className="font-serif text-4xl text-white md:text-5xl">
          Create Auction
        </h1>
        <p className="mt-4 text-white/65">
          Upload your item photo, set a prize in your local currency, and we
          convert it to XLM for on-chain escrow. Bidders also pay in XLM.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 border border-cyan/10 bg-navy-card p-8 md:p-10"
      >
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
            Title
          </span>
          <input
            required
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className="mt-3 w-full border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
            Description
          </span>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="mt-3 w-full border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
          />
        </label>

        <ImageUploadField
          imageUrl={form.imageUrl}
          onImageUrlChange={(imageUrl) =>
            setForm((current) => ({ ...current, imageUrl }))
          }
        />

        <CurrencyAmountField
          label="Prize value"
          amount={form.prizeAmount}
          currency={form.prizeCurrency}
          rates={rates}
          ratesLoading={ratesLoading}
          xlmEquivalent={prizeXlm}
          onAmountChange={(prizeAmount) =>
            setForm((current) => ({ ...current, prizeAmount }))
          }
          onCurrencyChange={(prizeCurrency) =>
            setForm((current) => ({ ...current, prizeCurrency }))
          }
        />

        <CurrencyAmountField
          label="Minimum opening bid"
          amount={form.minBidAmount}
          currency={form.minBidCurrency}
          rates={rates}
          ratesLoading={ratesLoading}
          xlmEquivalent={minBidXlm}
          onAmountChange={(minBidAmount) =>
            setForm((current) => ({ ...current, minBidAmount }))
          }
          onCurrencyChange={(minBidCurrency) =>
            setForm((current) => ({ ...current, minBidCurrency }))
          }
        />

        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
            Duration (hours)
          </span>
          <input
            required
            type="number"
            min="1"
            value={form.durationHours}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                durationHours: event.target.value,
              }))
            }
            className="mt-3 w-full border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
          />
        </label>

        <button
          type="submit"
          disabled={loading || ratesLoading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Auction"}
        </button>

        {message && (
          <p className="text-sm text-cyan-muted" role="status">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
