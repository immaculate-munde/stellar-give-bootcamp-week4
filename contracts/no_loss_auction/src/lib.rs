#![no_std]

use sep_41_token::TokenClient;
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuctionStatus {
    Active = 0,
    Finalized = 1,
    Cancelled = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Auction {
    pub seller: Address,
    pub bid_token: Address,
    pub prize_token: Address,
    pub prize_amount: i128,
    pub min_bid: i128,
    pub highest_bid: i128,
    pub highest_bidder: Option<Address>,
    pub end_time: u64,
    pub bid_count: u32,
    pub status: AuctionStatus,
    pub title: String,
    pub description: String,
    pub image_url: String,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    AuctionCount,
    Auction(u32),
    PendingRefund(u32, Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AuctionNotFound = 1,
    AuctionNotActive = 2,
    AuctionEnded = 3,
    AuctionNotEnded = 4,
    BidTooLow = 5,
    NotSeller = 6,
    HasBids = 7,
    NoBids = 8,
    NoPendingRefund = 9,
    InvalidEndTime = 10,
    InvalidAmount = 11,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuctionCreated {
    pub auction_id: u32,
    pub seller: Address,
    pub end_time: u64,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BidPlaced {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RefundIssued {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RefundClaimed {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuctionFinalized {
    pub auction_id: u32,
    pub winner: Option<Address>,
    pub winning_bid: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuctionCancelled {
    pub auction_id: u32,
    pub seller: Address,
}

#[contract]
pub struct NoLossAuction;

#[contractimpl]
impl NoLossAuction {
    pub fn get_auction_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::AuctionCount)
            .unwrap_or(0)
    }

    pub fn get_auction(env: Env, auction_id: u32) -> Result<Auction, Error> {
        Self::load_auction(&env, auction_id)
    }

    pub fn get_pending_refund(env: Env, auction_id: u32, bidder: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PendingRefund(auction_id, bidder))
            .unwrap_or(0)
    }

    pub fn create_auction(
        env: Env,
        seller: Address,
        bid_token: Address,
        prize_token: Address,
        prize_amount: i128,
        min_bid: i128,
        end_time: u64,
        title: String,
        description: String,
        image_url: String,
    ) -> Result<u32, Error> {
        seller.require_auth();

        if prize_amount <= 0 || min_bid <= 0 {
            return Err(Error::InvalidAmount);
        }

        let now = env.ledger().timestamp();
        if end_time <= now {
            return Err(Error::InvalidEndTime);
        }

        let contract = env.current_contract_address();
        TokenClient::new(&env, &prize_token).transfer_from(
            &contract,
            &seller,
            &contract,
            &prize_amount,
        );

        let auction_id = Self::get_auction_count(env.clone()) + 1;
        env.storage()
            .instance()
            .set(&DataKey::AuctionCount, &auction_id);

        let auction = Auction {
            seller: seller.clone(),
            bid_token,
            prize_token,
            prize_amount,
            min_bid,
            highest_bid: 0,
            highest_bidder: None,
            end_time,
            bid_count: 0,
            status: AuctionStatus::Active,
            title,
            description,
            image_url,
        };

        env.storage()
            .instance()
            .set(&DataKey::Auction(auction_id), &auction);

        AuctionCreated {
            auction_id,
            seller,
            end_time,
        }
        .publish(&env);

        Ok(auction_id)
    }

    pub fn place_bid(env: Env, bidder: Address, auction_id: u32, amount: i128) -> Result<(), Error> {
        bidder.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut auction = Self::load_auction(&env, auction_id)?;
        Self::ensure_active(&auction)?;

        let now = env.ledger().timestamp();
        if now >= auction.end_time {
            return Err(Error::AuctionEnded);
        }

        let min_required = if auction.bid_count == 0 {
            auction.min_bid
        } else {
            auction.highest_bid + 1
        };

        if amount < min_required {
            return Err(Error::BidTooLow);
        }

        let contract = env.current_contract_address();
        let bid_token = TokenClient::new(&env, &auction.bid_token);
        bid_token.transfer_from(&contract, &bidder, &contract, &amount);

        if let Some(prev_bidder) = auction.highest_bidder.clone() {
            let prev_amount = auction.highest_bid;
            Self::set_pending_refund(&env, auction_id, &prev_bidder, prev_amount);
            Self::execute_refund(&env, &auction.bid_token, auction_id, &prev_bidder)?;
        }

        auction.highest_bid = amount;
        auction.highest_bidder = Some(bidder.clone());
        auction.bid_count += 1;

        env.storage()
            .instance()
            .set(&DataKey::Auction(auction_id), &auction);

        BidPlaced {
            auction_id,
            bidder,
            amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn claim_refund(env: Env, bidder: Address, auction_id: u32) -> Result<(), Error> {
        bidder.require_auth();
        Self::load_auction(&env, auction_id)?;

        let amount = Self::get_pending_refund(env.clone(), auction_id, bidder.clone());
        if amount <= 0 {
            return Err(Error::NoPendingRefund);
        }

        Self::execute_refund(&env, &Self::load_auction(&env, auction_id)?.bid_token, auction_id, &bidder)?;

        RefundClaimed {
            auction_id,
            bidder,
            amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn finalize_auction(env: Env, auction_id: u32) -> Result<(), Error> {
        let mut auction = Self::load_auction(&env, auction_id)?;
        Self::ensure_active(&auction)?;

        let now = env.ledger().timestamp();
        if now < auction.end_time {
            return Err(Error::AuctionNotEnded);
        }

        let contract = env.current_contract_address();
        let bid_token = TokenClient::new(&env, &auction.bid_token);
        let prize_token = TokenClient::new(&env, &auction.prize_token);

        let winner = auction.highest_bidder.clone();
        let winning_bid = auction.highest_bid;

        if auction.bid_count > 0 {
            let winner = winner.clone().ok_or(Error::NoBids)?;
            bid_token.transfer(&contract, &auction.seller, &winning_bid);
            prize_token.transfer(&contract, &winner, &auction.prize_amount);
        } else {
            prize_token.transfer(&contract, &auction.seller, &auction.prize_amount);
        }

        auction.status = AuctionStatus::Finalized;
        env.storage()
            .instance()
            .set(&DataKey::Auction(auction_id), &auction);

        AuctionFinalized {
            auction_id,
            winner,
            winning_bid,
        }
        .publish(&env);

        Ok(())
    }

    pub fn cancel_auction(env: Env, seller: Address, auction_id: u32) -> Result<(), Error> {
        seller.require_auth();

        let mut auction = Self::load_auction(&env, auction_id)?;
        Self::ensure_active(&auction)?;

        if auction.seller != seller {
            return Err(Error::NotSeller);
        }

        if auction.bid_count > 0 {
            return Err(Error::HasBids);
        }

        let contract = env.current_contract_address();
        TokenClient::new(&env, &auction.prize_token).transfer(
            &contract,
            &seller,
            &auction.prize_amount,
        );

        auction.status = AuctionStatus::Cancelled;
        env.storage()
            .instance()
            .set(&DataKey::Auction(auction_id), &auction);

        AuctionCancelled {
            auction_id,
            seller,
        }
        .publish(&env);

        Ok(())
    }
}

impl NoLossAuction {
    fn load_auction(env: &Env, auction_id: u32) -> Result<Auction, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Auction(auction_id))
            .ok_or(Error::AuctionNotFound)
    }

    fn ensure_active(auction: &Auction) -> Result<(), Error> {
        if auction.status != AuctionStatus::Active {
            return Err(Error::AuctionNotActive);
        }
        Ok(())
    }

    fn set_pending_refund(env: &Env, auction_id: u32, bidder: &Address, amount: i128) {
        env.storage().instance().set(
            &DataKey::PendingRefund(auction_id, bidder.clone()),
            &amount,
        );
    }

    fn clear_pending_refund(env: &Env, auction_id: u32, bidder: &Address) {
        env.storage().instance().set(
            &DataKey::PendingRefund(auction_id, bidder.clone()),
            &0_i128,
        );
    }

    fn execute_refund(
        env: &Env,
        bid_token: &Address,
        auction_id: u32,
        bidder: &Address,
    ) -> Result<(), Error> {
        let amount = env
            .storage()
            .instance()
            .get::<DataKey, i128>(&DataKey::PendingRefund(auction_id, bidder.clone()))
            .unwrap_or(0);

        if amount <= 0 {
            return Err(Error::NoPendingRefund);
        }

        let contract = env.current_contract_address();
        TokenClient::new(env, bid_token).transfer(&contract, bidder, &amount);
        Self::clear_pending_refund(env, auction_id, bidder);

        RefundIssued {
            auction_id,
            bidder: bidder.clone(),
            amount,
        }
        .publish(env);

        Ok(())
    }
}

mod test;
