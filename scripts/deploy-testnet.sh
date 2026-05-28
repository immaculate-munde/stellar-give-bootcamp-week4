#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Building contract..."
stellar contract build

echo "Deploying to testnet..."
stellar contract deploy \
  --wasm target/wasm32v1-none/release/no_loss_auction.wasm \
  --source "${DEPLOYER:-mywallet}" \
  --network testnet \
  --alias no_loss_auction

echo "Generating TypeScript bindings..."
stellar contract bindings typescript \
  --wasm target/wasm32v1-none/release/no_loss_auction.wasm \
  --output-dir packages/no_loss_auction \
  --network testnet

echo "Done. Update frontend/.env.local with the contract ID above."
