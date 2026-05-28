import { Client, Auction, AuctionStatus } from "no_loss_auction";
import {
  Address,
  Contract,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
  TOKEN_DECIMALS,
} from "./config";
import { formatError } from "./errors";

export type AuctionView = {
  id: number;
  seller: string;
  bidToken: string;
  prizeToken: string;
  prizeAmount: bigint;
  minBid: bigint;
  highestBid: bigint;
  highestBidder: string | null;
  endTime: bigint;
  bidCount: number;
  status: AuctionStatus;
  title: string;
  description: string;
  imageUrl: string;
};

function toView(id: number, auction: Auction): AuctionView {
  return {
    id,
    seller: auction.seller,
    bidToken: auction.bid_token,
    prizeToken: auction.prize_token,
    prizeAmount: BigInt(auction.prize_amount),
    minBid: BigInt(auction.min_bid),
    highestBid: BigInt(auction.highest_bid),
    highestBidder: auction.highest_bidder ?? null,
    endTime: BigInt(auction.end_time),
    bidCount: Number(auction.bid_count),
    status: auction.status,
    title: auction.title,
    description: auction.description,
    imageUrl: auction.image_url,
  };
}

export function getContractClient(publicKey?: string) {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    allowHttp: true,
  });
}

export async function fetchAuctionCount(): Promise<number> {
  const client = getContractClient();
  const tx = await client.get_auction_count();
  return Number(tx.result);
}

export async function fetchAuction(id: number): Promise<AuctionView | null> {
  const client = getContractClient();
  const tx = await client.get_auction({ auction_id: id });
  if (!tx.result.isOk()) return null;
  return toView(id, tx.result.unwrap());
}

export async function fetchAuctions(): Promise<AuctionView[]> {
  const count = await fetchAuctionCount();
  const auctions: AuctionView[] = [];
  for (let id = 1; id <= count; id += 1) {
    const auction = await fetchAuction(id);
    if (auction) auctions.push(auction);
  }
  return auctions.reverse();
}

export async function fetchPendingRefund(
  auctionId: number,
  bidder: string,
): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.get_pending_refund({
    auction_id: auctionId,
    bidder,
  });
  return BigInt(tx.result);
}

type SignFn = (xdr: string) => Promise<string>;

async function waitForTransaction(hash: string) {
  const server = new rpc.Server(RPC_URL, { allowHttp: true });

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const tx = await server.getTransaction(hash);

    if (tx.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return tx;
    }

    if (tx.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(
        "On-chain transaction failed. Check your wallet balance and try again.",
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    "Transaction is still pending. Wait a moment and refresh the page.",
  );
}

async function signAndSendAssembled(
  assembled: {
    signAndSend: (opts?: {
      signTransaction?: (xdr: string) => Promise<{ signedTxXdr: string }>;
    }) => Promise<unknown>;
  },
  signTransaction: SignFn,
) {
  try {
    return await assembled.signAndSend({
      signTransaction: async (xdr) => ({
        signedTxXdr: await signTransaction(xdr),
      }),
    });
  } catch (error) {
    throw new Error(formatError(error));
  }
}

async function ensureTokenApproval(
  owner: string,
  tokenId: string,
  spender: string,
  amount: bigint,
  signTransaction: SignFn,
) {
  const token = new Contract(tokenId);
  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const [account, latestLedger] = await Promise.all([
    server.getAccount(owner),
    server.getLatestLedger(),
  ]);
  const expirationLedger = latestLedger.sequence + 100_000;

  let tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      token.call(
        "approve",
        new Address(owner).toScVal(),
        new Address(spender).toScVal(),
        nativeToScVal(amount, { type: "i128" }),
        nativeToScVal(expirationLedger, { type: "u32" }),
      ),
    )
    .setTimeout(300)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Token approval simulation failed: ${simulated.error}`);
  }

  tx = rpc.assembleTransaction(tx, simulated).build();

  const signedXdr = await signTransaction(tx.toXDR());
  const response = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE),
  );
  if (response.status === "ERROR") {
    throw new Error(response.errorResult?.toString() ?? "Approval failed");
  }
  if (response.hash) {
    await waitForTransaction(response.hash);
  }
}

export async function createAuction(
  params: {
    seller: string;
    bidToken: string;
    prizeToken: string;
    prizeAmount: bigint;
    minBid: bigint;
    endTime: number;
    title: string;
    description: string;
    imageUrl: string;
  },
  signTransaction: SignFn,
) {
  const client = getContractClient(params.seller);
  await ensureTokenApproval(
    params.seller,
    params.prizeToken,
    CONTRACT_ID,
    params.prizeAmount,
    signTransaction,
  );

  const tx = await client.create_auction({
    seller: params.seller,
    bid_token: params.bidToken,
    prize_token: params.prizeToken,
    prize_amount: params.prizeAmount,
    min_bid: params.minBid,
    end_time: BigInt(params.endTime),
    title: params.title,
    description: params.description,
    image_url: params.imageUrl,
  });
  return signAndSendAssembled(tx, signTransaction);
}

export async function placeBid(
  bidder: string,
  auctionId: number,
  amount: bigint,
  bidToken: string,
  signTransaction: SignFn,
) {
  const client = getContractClient(bidder);
  await ensureTokenApproval(bidder, bidToken, CONTRACT_ID, amount, signTransaction);
  const tx = await client.place_bid({
    bidder,
    auction_id: auctionId,
    amount,
  });
  return signAndSendAssembled(tx, signTransaction);
}

export async function claimRefund(
  bidder: string,
  auctionId: number,
  signTransaction: SignFn,
) {
  const client = getContractClient(bidder);
  const tx = await client.claim_refund({ bidder, auction_id: auctionId });
  return signAndSendAssembled(tx, signTransaction);
}

export async function finalizeAuction(
  caller: string,
  auctionId: number,
  signTransaction: SignFn,
) {
  const client = getContractClient(caller);
  const tx = await client.finalize_auction({ auction_id: auctionId });
  return signAndSendAssembled(tx, signTransaction);
}

export async function cancelAuction(
  seller: string,
  auctionId: number,
  signTransaction: SignFn,
) {
  const client = getContractClient(seller);
  const tx = await client.cancel_auction({ seller, auction_id: auctionId });
  return signAndSendAssembled(tx, signTransaction);
}

export { TOKEN_DECIMALS };
