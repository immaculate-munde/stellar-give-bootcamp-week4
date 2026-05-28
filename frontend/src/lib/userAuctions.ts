import {
  AuctionView,
  fetchAuctions,
  fetchPendingRefund,
} from "@/lib/auction";
import { AuctionStatus } from "no_loss_auction";
import { isAuctionLive } from "@/lib/utils";

export type UserAuctionActivity = {
  created: AuctionView[];
  activeBids: AuctionView[];
  won: AuctionView[];
  pendingRefunds: { auction: AuctionView; amount: bigint }[];
};

export async function fetchUserAuctionActivity(
  address: string,
): Promise<UserAuctionActivity> {
  const auctions = await fetchAuctions();

  const created = auctions.filter((auction) => auction.seller === address);

  const activeBids = auctions.filter(
    (auction) =>
      auction.highestBidder === address &&
      auction.status === AuctionStatus.Active &&
      isAuctionLive(auction.status, auction.endTime),
  );

  const won = auctions.filter(
    (auction) =>
      auction.highestBidder === address &&
      auction.status === AuctionStatus.Finalized,
  );

  const pendingRefunds: { auction: AuctionView; amount: bigint }[] = [];
  await Promise.all(
    auctions.map(async (auction) => {
      const amount = await fetchPendingRefund(auction.id, address);
      if (amount > 0n) {
        pendingRefunds.push({ auction, amount });
      }
    }),
  );

  return { created, activeBids, won, pendingRefunds };
}
