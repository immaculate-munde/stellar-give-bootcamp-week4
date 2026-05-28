export function formatTokenAmount(amount: bigint, decimals = 7): string {
  const negative = amount < 0n;
  const value = negative ? -amount : amount;
  const str = value.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const fraction = str.slice(-decimals).replace(/0+$/, "");
  const formatted = fraction ? `${whole}.${fraction}` : whole;
  return negative ? `-${formatted}` : formatted;
}

export function parseTokenAmount(value: string, decimals = 7): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  const [whole, fraction = ""] = trimmed.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(`${whole}${paddedFraction}`);
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

export function auctionStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return "LIVE";
    case 1:
      return "ENDED";
    case 2:
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
}

export function isAuctionLive(status: number, endTime: bigint): boolean {
  if (status !== 0) return false;
  return BigInt(Math.floor(Date.now() / 1000)) < endTime;
}
