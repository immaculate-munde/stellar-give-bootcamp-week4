"use client";

import {
  CURRENCY_OPTIONS,
  FiatCurrency,
  formatXlmEquivalent,
  getRateForCurrency,
} from "@/lib/currency";

type Props = {
  label: string;
  amount: string;
  currency: FiatCurrency;
  rates: Partial<Record<FiatCurrency, number>>;
  ratesLoading: boolean;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: FiatCurrency) => void;
  xlmEquivalent: number | null;
};

export function CurrencyAmountField({
  label,
  amount,
  currency,
  rates,
  ratesLoading,
  onAmountChange,
  onCurrencyChange,
  xlmEquivalent,
}: Props) {
  const rate = getRateForCurrency(currency, rates);

  return (
    <div className="space-y-3">
      <span className="text-xs uppercase tracking-[0.25em] text-cyan-muted">
        {label}
      </span>

      <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
        <select
          value={currency}
          onChange={(event) =>
            onCurrencyChange(event.target.value as FiatCurrency)
          }
          className="border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code}
            </option>
          ))}
        </select>

        <input
          required
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={currency === "XLM" ? "10" : "5000"}
          className="border border-cyan/20 bg-navy px-4 py-3 text-white outline-none focus:border-cyan"
        />
      </div>

      <div className="rounded border border-cyan/15 bg-navy/60 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-muted">
          Equivalent on-chain (XLM)
        </p>
        <p className="mt-2 font-serif text-2xl text-cyan">
          {ratesLoading && currency !== "XLM"
            ? "Loading rate..."
            : `${formatXlmEquivalent(xlmEquivalent)} XLM`}
        </p>
        {currency !== "XLM" && rate && !ratesLoading && (
          <p className="mt-1 text-xs text-white/50">
            1 XLM ≈ {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            {currency}
          </p>
        )}
      </div>
    </div>
  );
}
