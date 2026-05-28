export function formatError(error: unknown): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && message !== "[object Object]") {
      return message;
    }
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const nested = record.message;

    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }

    if (typeof nested === "object" && nested !== null) {
      const status = (nested as Record<string, unknown>).status;
      if (status === 204) {
        return "Wallet returned an empty response. Open your wallet, approve the transaction, and try again.";
      }

      try {
        return JSON.stringify(nested);
      } catch {
        // fall through
      }
    }

    if (record.status === 204) {
      return "Wallet returned an empty response. Open your wallet, approve the transaction, and try again.";
    }

    if (typeof record.status === "number") {
      return `Request failed with status ${record.status}`;
    }

    if (record.code === -4) {
      return "Transaction rejected in wallet";
    }

    if (record.code === -3) {
      return typeof nested === "string"
        ? nested
        : "Invalid wallet request. Check that your wallet is on Testnet.";
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Something went wrong. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}
