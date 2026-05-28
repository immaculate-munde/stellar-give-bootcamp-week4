export type FiatCurrency = "XLM" | "KES" | "USD" | "EUR" | "GBP" | "NGN";

export const CURRENCY_OPTIONS: { code: FiatCurrency; label: string }[] = [
  { code: "XLM", label: "XLM (Stellar)" },
  { code: "KES", label: "KES (Kenyan Shilling)" },
  { code: "USD", label: "USD (US Dollar)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "GBP", label: "GBP (British Pound)" },
  { code: "NGN", label: "NGN (Nigerian Naira)" },
];

const COINGECKO_FIAT_MAP: Record<Exclude<FiatCurrency, "XLM">, string> = {
  KES: "kes",
  USD: "usd",
  EUR: "eur",
  GBP: "gbp",
  NGN: "ngn",
};

let cachedRates: Partial<Record<FiatCurrency, number>> | null = null;
let cacheExpiry = 0;

export async function fetchXlmRates(): Promise<
  Partial<Record<FiatCurrency, number>>
> {
  const now = Date.now();
  if (cachedRates && now < cacheExpiry) {
    return cachedRates;
  }

  const response = await fetch("/api/rates");

  if (!response.ok) {
    throw new Error("Unable to fetch exchange rates");
  }

  const data = (await response.json()) as {
    stellar?: Record<string, number>;
  };

  const stellar = data.stellar ?? {};
  const rates: Partial<Record<FiatCurrency, number>> = { XLM: 1 };

  (Object.entries(COINGECKO_FIAT_MAP) as [Exclude<FiatCurrency, "XLM">, string][]).forEach(
    ([code, geckoKey]) => {
      const value = stellar[geckoKey];
      if (typeof value === "number" && value > 0) {
        rates[code] = value;
      }
    },
  );

  cachedRates = rates;
  cacheExpiry = now + 5 * 60 * 1000;
  return rates;
}

/** How much local/fiat currency equals 1 XLM */
export function getRateForCurrency(
  currency: FiatCurrency,
  rates: Partial<Record<FiatCurrency, number>>,
): number | null {
  if (currency === "XLM") return 1;
  return rates[currency] ?? null;
}

export function convertLocalToXlm(
  localAmount: string,
  currency: FiatCurrency,
  rates: Partial<Record<FiatCurrency, number>>,
): number | null {
  const amount = Number(localAmount);
  if (!localAmount.trim() || Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  if (currency === "XLM") return amount;

  const rate = getRateForCurrency(currency, rates);
  if (!rate) return null;

  return amount / rate;
}

export function formatXlmEquivalent(xlm: number | null): string {
  if (xlm === null) return "—";
  if (xlm < 0.0000001) return "< 0.0000001";
  return xlm.toFixed(7).replace(/\.?0+$/, "");
}
