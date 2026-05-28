function env(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

/** Testnet native XLM Stellar Asset Contract (SEP-41). */
export const TESTNET_NATIVE_XLM_SAC =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export const CONTRACT_ID = env(
  "NEXT_PUBLIC_CONTRACT_ID",
  "CDRIREBGHCOS3YU6KMFGXLLBOXCWMYXX2VQ7AYX2G5YBWVPNJ7SHHFHJ",
);

export const RPC_URL = env(
  "NEXT_PUBLIC_RPC_URL",
  "https://soroban-testnet.stellar.org",
);

export const NETWORK_PASSPHRASE = env(
  "NEXT_PUBLIC_NETWORK_PASSPHRASE",
  "Test SDF Network ; September 2015",
);

export const BID_TOKEN = env("NEXT_PUBLIC_BID_TOKEN", TESTNET_NATIVE_XLM_SAC);

export const PRIZE_TOKEN = env("NEXT_PUBLIC_PRIZE_TOKEN", TESTNET_NATIVE_XLM_SAC);

export const TOKEN_DECIMALS = 7;
