# AuctionWithMe — No-Loss Auction Protocol

**AuctionWithMe** is a decentralized no-loss auction dApp on **Stellar Soroban**. List items, bid with XLM, and get auto-refunded if outbid. This repo contains the Soroban smart contract and the integrated **AuctionWithMe** Next.js frontend.

**Live app:** [auction-with-me.vercel.app](https://auction-with-me.vercel.app)

## Testnet Contract

| Field | Value |
|-------|-------|
| **Contract ID** | `CDRIREBGHCOS3YU6KMFGXLLBOXCWMYXX2VQ7AYX2G5YBWVPNJ7SHHFHJ` |
| **Network** | Testnet |
| **RPC** | `https://soroban-testnet.stellar.org` |
| **Explorer** | [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CDRIREBGHCOS3YU6KMFGXLLBOXCWMYXX2VQ7AYX2G5YBWVPNJ7SHHFHJ) |

## Features

### Smart contract (`contracts/no_loss_auction`)
- **Create auction** — seller escrows SEP-41 prize token in contract
- **Place bid** — SEP-41 bid token; tracks highest bidder
- **Auto-refund** — previous highest bidder refunded on new bid
- **Claim refund** — manual fallback from pending refund map
- **Finalize auction** — after deadline, distributes bid to seller and prize to winner
- **Cancel auction** — seller only, only when no bids exist

### Frontend — AuctionWithMe (`frontend/`)
- Navy/cyan theme with luxury-inspired layouts
- Home hero, asymmetric auction grid, single-item product page
- Multi-wallet support (Freighter, Albedo, xBull, LOBSTR, and more)
- Wallet login only — no email sign-up; **My Account** dashboard
- Dark / light mode, FAQ, image upload, fiat-to-XLM conversion on create
- All contract functions wired: create, bid, claim, finalize, cancel

## Project structure

```
├── contracts/no_loss_auction/   # Soroban contract + tests
├── packages/no_loss_auction/      # Generated TypeScript bindings
├── frontend/                    # AuctionWithMe Next.js app
├── scripts/deploy-testnet.sh    # Deploy + regenerate bindings
└── environments.toml            # Network + contract config
```

## Prerequisites

- [Rust](https://rustup.rs/) + `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli) v26+
- Node.js 18+
- A Stellar wallet (e.g. [Freighter](https://www.freighter.app/), Albedo, xBull, LOBSTR) on **Testnet**

Install WASM target:

```bash
rustup target add wasm32v1-none
```

## Build & test contract

```bash
stellar contract build
cd contracts/no_loss_auction && cargo test
```

## Deploy to testnet

```bash
chmod +x scripts/deploy-testnet.sh
./scripts/deploy-testnet.sh
```

Or manually:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/no_loss_auction.wasm \
  --source mywallet \
  --network testnet \
  --alias no_loss_auction
```

Regenerate TypeScript bindings:

```bash
stellar contract bindings typescript \
  --wasm target/wasm32v1-none/release/no_loss_auction.wasm \
  --output-dir packages/no_loss_auction \
  --network testnet
cd packages/no_loss_auction && npm install && npm run build
```

## Run AuctionWithMe locally

```bash
cd frontend
cp .env.example .env.local   # or use defaults
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed auction contract ID |
| `NEXT_PUBLIC_RPC_URL` | Soroban RPC endpoint |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Stellar network passphrase |
| `NEXT_PUBLIC_BID_TOKEN` | SEP-41 token for bids |
| `NEXT_PUBLIC_PRIZE_TOKEN` | SEP-41 token for prize escrow |
| `BLOB_READ_WRITE_TOKEN` | Server-only. Enables permanent image uploads via [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional. WalletConnect for mobile Freighter/LOBSTR |

Default demo tokens use testnet native XLM SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

## Demo flow (AuctionWithMe)

1. Open **AuctionWithMe** and connect a Stellar wallet on **Testnet**
2. Fund account via [Stellar testnet faucet](https://laboratory.stellar.org/#account-creator?network=test)
3. **Create auction** at `/create` — approve prize token, submit
4. **Place bid** on `/auctions/[id]` — approve bid token, submit
5. Outbid another wallet — first bidder receives auto-refund
6. After deadline, **Finalize auction**
7. Seller can **Cancel** only if no bids were placed

## Test plan

### Contract tests
```bash
cd contracts/no_loss_auction && cargo test
```

Covers: prize escrow, auto-refund, manual claim, finalize with/without bids, cancel rules, bid validation.

### Frontend checks
- [ ] Home page loads featured auction + stats bar
- [ ] `/auctions` grid is responsive (mobile stack, desktop masonry)
- [ ] `/auctions/[id]` shows bid form, countdown, action buttons
- [ ] Wallet connect/disconnect works
- [ ] Create auction submits on-chain transaction
- [ ] Place bid, claim refund, finalize, cancel all invoke contract

## Contract API

| Function | Description |
|----------|-------------|
| `create_auction` | Escrow prize token, store metadata |
| `place_bid` | Bid with SEP-41 token, auto-refund previous leader |
| `claim_refund` | Claim pending refund manually |
| `finalize_auction` | Settle after `end_time` |
| `cancel_auction` | Return prize to seller if no bids |
| `get_auction` / `get_auction_count` | Read-only queries |

## License

MIT
