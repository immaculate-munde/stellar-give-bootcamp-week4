#![cfg(test)]

use super::*;
use sep_41_token::testutils::{MockTokenClient, MockTokenWASM};
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, Env, String};

fn create_token(env: &Env) -> (Address, MockTokenClient<'_>) {
    let admin = Address::generate(env);
    let token_id = env.register(MockTokenWASM, ());
    let client = MockTokenClient::new(env, &token_id);
    client.initialize(
        &admin,
        &7,
        &String::from_str(env, "Token"),
        &String::from_str(env, "TKN"),
    );
    (token_id, client)
}

fn mint_and_approve(
    token_client: &MockTokenClient,
    owner: &Address,
    spender: &Address,
    amount: i128,
) {
    token_client.mint(owner, &amount);
    token_client.approve(owner, spender, &amount, &100000);
}

fn create_sample_auction(
    client: &NoLossAuctionClient,
    seller: &Address,
    bid_token: &Address,
    prize_token: &Address,
    end_time: u64,
) -> u32 {
    client.create_auction(
        seller,
        bid_token,
        prize_token,
        &500_000,
        &100_000,
        &end_time,
        &String::from_str(&client.env, "Vintage Dress"),
        &String::from_str(&client.env, "A timeless piece"),
        &String::from_str(&client.env, "https://example.com/dress.jpg"),
    )
}

#[test]
fn create_auction_escrows_prize() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let (bid_token, _) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    let auction_id = create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);

    assert_eq!(auction_id, 1);
    assert_eq!(client.get_auction_count(), 1);

    let auction = client.get_auction(&1);
    assert_eq!(auction.seller, seller);
    assert_eq!(auction.prize_amount, 500_000);
    assert_eq!(auction.status, AuctionStatus::Active);
    assert_eq!(auction.bid_count, 0);
    assert_eq!(prize_token_client.balance(&contract_id), 500_000);
}

#[test]
fn place_bid_and_auto_refund() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder1 = Address::generate(&env);
    let bidder2 = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder1, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder2, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);

    client.place_bid(&bidder1, &1, &150_000);
    assert_eq!(bid_token_client.balance(&contract_id), 150_000);

    client.place_bid(&bidder2, &1, &200_000);

    assert_eq!(bid_token_client.balance(&bidder1), 1_000_000);
    assert_eq!(bid_token_client.balance(&bidder2), 800_000);
    assert_eq!(bid_token_client.balance(&contract_id), 200_000);
    assert_eq!(client.get_pending_refund(&1, &bidder1), 0);

    let auction = client.get_auction(&1);
    assert_eq!(auction.highest_bid, 200_000);
    assert_eq!(auction.highest_bidder, Some(bidder2));
    assert_eq!(auction.bid_count, 2);
}

#[test]
fn claim_refund_works_when_pending_exists() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);
    client.place_bid(&bidder, &1, &150_000);

    env.as_contract(&contract_id, || {
        NoLossAuction::set_pending_refund(&env, 1, &bidder, 150_000);
    });

    assert_eq!(client.get_pending_refund(&1, &bidder), 150_000);
    client.claim_refund(&bidder, &1);
    assert_eq!(client.get_pending_refund(&1, &bidder), 0);
    assert_eq!(bid_token_client.balance(&bidder), 1_000_000);
}

#[test]
fn finalize_auction_distributes_assets() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);
    client.place_bid(&bidder, &1, &150_000);

    env.ledger().set_timestamp(end_time + 1);
    client.finalize_auction(&1);

    let auction = client.get_auction(&1);
    assert_eq!(auction.status, AuctionStatus::Finalized);
    assert_eq!(bid_token_client.balance(&seller), 150_000);
    assert_eq!(prize_token_client.balance(&bidder), 500_000);
    assert_eq!(bid_token_client.balance(&contract_id), 0);
    assert_eq!(prize_token_client.balance(&contract_id), 0);
}

#[test]
fn finalize_auction_without_bids_returns_prize() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let (bid_token, _) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);

    env.ledger().set_timestamp(end_time + 1);
    client.finalize_auction(&1);

    assert_eq!(prize_token_client.balance(&seller), 1_000_000);
}

#[test]
fn cancel_auction_without_bids() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let (bid_token, _) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);

    client.cancel_auction(&seller, &1);

    let auction = client.get_auction(&1);
    assert_eq!(auction.status, AuctionStatus::Cancelled);
    assert_eq!(prize_token_client.balance(&seller), 1_000_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn cancel_auction_with_bids_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);
    client.place_bid(&bidder, &1, &150_000);
    client.cancel_auction(&seller, &1);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn bid_below_minimum_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);
    client.place_bid(&bidder, &1, &50_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn bid_after_deadline_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);

    let (bid_token, bid_token_client) = create_token(&env);
    let (prize_token, prize_token_client) = create_token(&env);

    let contract_id = env.register(NoLossAuction, ());
    let client = NoLossAuctionClient::new(&env, &contract_id);

    mint_and_approve(&prize_token_client, &seller, &contract_id, 1_000_000);
    mint_and_approve(&bid_token_client, &bidder, &contract_id, 1_000_000);

    let end_time = env.ledger().timestamp() + 3600;
    create_sample_auction(&client, &seller, &bid_token, &prize_token, end_time);

    env.ledger().set_timestamp(end_time + 1);
    client.place_bid(&bidder, &1, &150_000);
}
