import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: {message:"AuctionNotFound"},
  2: {message:"AuctionNotActive"},
  3: {message:"AuctionEnded"},
  4: {message:"AuctionNotEnded"},
  5: {message:"BidTooLow"},
  6: {message:"NotSeller"},
  7: {message:"HasBids"},
  8: {message:"NoBids"},
  9: {message:"NoPendingRefund"},
  10: {message:"InvalidEndTime"},
  11: {message:"InvalidAmount"}
}


export interface Auction {
  bid_count: u32;
  bid_token: string;
  description: string;
  end_time: u64;
  highest_bid: i128;
  highest_bidder: Option<string>;
  image_url: string;
  min_bid: i128;
  prize_amount: i128;
  prize_token: string;
  seller: string;
  status: AuctionStatus;
  title: string;
}

export type DataKey = {tag: "AuctionCount", values: void} | {tag: "Auction", values: readonly [u32]} | {tag: "PendingRefund", values: readonly [u32, string]};



export enum AuctionStatus {
  Active = 0,
  Finalized = 1,
  Cancelled = 2,
}





export interface Client {
  /**
   * Construct and simulate a place_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  place_bid: ({bidder, auction_id, amount}: {bidder: string, auction_id: u32, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_auction: ({auction_id}: {auction_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Auction>>>

  /**
   * Construct and simulate a claim_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_refund: ({bidder, auction_id}: {bidder: string, auction_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a cancel_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_auction: ({seller, auction_id}: {seller: string, auction_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_auction: ({seller, bid_token, prize_token, prize_amount, min_bid, end_time, title, description, image_url}: {seller: string, bid_token: string, prize_token: string, prize_amount: i128, min_bid: i128, end_time: u64, title: string, description: string, image_url: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a finalize_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  finalize_auction: ({auction_id}: {auction_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_auction_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_auction_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_pending_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pending_refund: ({auction_id, bidder}: {auction_id: u32, bidder: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAAPQXVjdGlvbk5vdEZvdW5kAAAAAAEAAAAAAAAAEEF1Y3Rpb25Ob3RBY3RpdmUAAAACAAAAAAAAAAxBdWN0aW9uRW5kZWQAAAADAAAAAAAAAA9BdWN0aW9uTm90RW5kZWQAAAAABAAAAAAAAAAJQmlkVG9vTG93AAAAAAAABQAAAAAAAAAJTm90U2VsbGVyAAAAAAAABgAAAAAAAAAHSGFzQmlkcwAAAAAHAAAAAAAAAAZOb0JpZHMAAAAAAAgAAAAAAAAAD05vUGVuZGluZ1JlZnVuZAAAAAAJAAAAAAAAAA5JbnZhbGlkRW5kVGltZQAAAAAACgAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAs=",
        "AAAAAQAAAAAAAAAAAAAAB0F1Y3Rpb24AAAAADQAAAAAAAAAJYmlkX2NvdW50AAAAAAAABAAAAAAAAAAJYmlkX3Rva2VuAAAAAAAAEwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAIZW5kX3RpbWUAAAAGAAAAAAAAAAtoaWdoZXN0X2JpZAAAAAALAAAAAAAAAA5oaWdoZXN0X2JpZGRlcgAAAAAD6AAAABMAAAAAAAAACWltYWdlX3VybAAAAAAAABAAAAAAAAAAB21pbl9iaWQAAAAACwAAAAAAAAAMcHJpemVfYW1vdW50AAAACwAAAAAAAAALcHJpemVfdG9rZW4AAAAAEwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAANQXVjdGlvblN0YXR1cwAAAAAAAAAAAAAFdGl0bGUAAAAAAAAQ",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAADEF1Y3Rpb25Db3VudAAAAAEAAAAAAAAAB0F1Y3Rpb24AAAAAAQAAAAQAAAABAAAAAAAAAA1QZW5kaW5nUmVmdW5kAAAAAAAAAgAAAAQAAAAT",
        "AAAABQAAAAAAAAAAAAAACUJpZFBsYWNlZAAAAAAAAAEAAAAKYmlkX3BsYWNlZAAAAAAAAwAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABAAAAAAAAAAAAAAABmJpZGRlcgAAAAAAEwAAAAAAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAADFJlZnVuZElzc3VlZAAAAAEAAAANcmVmdW5kX2lzc3VlZAAAAAAAAAMAAAAAAAAACmF1Y3Rpb25faWQAAAAAAAQAAAAAAAAAAAAAAAZiaWRkZXIAAAAAABMAAAAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAAg==",
        "AAAAAwAAAAAAAAAAAAAADUF1Y3Rpb25TdGF0dXMAAAAAAAADAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAACUZpbmFsaXplZAAAAAAAAAEAAAAAAAAACUNhbmNlbGxlZAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAADVJlZnVuZENsYWltZWQAAAAAAAABAAAADnJlZnVuZF9jbGFpbWVkAAAAAAADAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAEAAAAAAAAAAAAAAAGYmlkZGVyAAAAAAATAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAADkF1Y3Rpb25DcmVhdGVkAAAAAAABAAAAD2F1Y3Rpb25fY3JlYXRlZAAAAAADAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAEAAAAAAAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAAAAAAIZW5kX3RpbWUAAAAGAAAAAAAAAAI=",
        "AAAAAAAAAAAAAAAJcGxhY2VfYmlkAAAAAAAAAwAAAAAAAAAGYmlkZGVyAAAAAAATAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAEAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAAD",
        "AAAABQAAAAAAAAAAAAAAEEF1Y3Rpb25DYW5jZWxsZWQAAAABAAAAEWF1Y3Rpb25fY2FuY2VsbGVkAAAAAAAAAgAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABAAAAAAAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAEEF1Y3Rpb25GaW5hbGl6ZWQAAAABAAAAEWF1Y3Rpb25fZmluYWxpemVkAAAAAAAAAwAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABAAAAAAAAAAAAAAABndpbm5lcgAAAAAD6AAAABMAAAAAAAAAAAAAAAt3aW5uaW5nX2JpZAAAAAALAAAAAAAAAAI=",
        "AAAAAAAAAAAAAAALZ2V0X2F1Y3Rpb24AAAAAAQAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABAAAAAEAAAPpAAAH0AAAAAdBdWN0aW9uAAAAAAM=",
        "AAAAAAAAAAAAAAAMY2xhaW1fcmVmdW5kAAAAAgAAAAAAAAAGYmlkZGVyAAAAAAATAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAOY2FuY2VsX2F1Y3Rpb24AAAAAAAIAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAOY3JlYXRlX2F1Y3Rpb24AAAAAAAkAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAJYmlkX3Rva2VuAAAAAAAAEwAAAAAAAAALcHJpemVfdG9rZW4AAAAAEwAAAAAAAAAMcHJpemVfYW1vdW50AAAACwAAAAAAAAAHbWluX2JpZAAAAAALAAAAAAAAAAhlbmRfdGltZQAAAAYAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAEAAAPpAAAABAAAAAM=",
        "AAAAAAAAAAAAAAAQZmluYWxpemVfYXVjdGlvbgAAAAEAAAAAAAAACmF1Y3Rpb25faWQAAAAAAAQAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAARZ2V0X2F1Y3Rpb25fY291bnQAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAASZ2V0X3BlbmRpbmdfcmVmdW5kAAAAAAACAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAEAAAAAAAAAAZiaWRkZXIAAAAAABMAAAABAAAACw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    place_bid: this.txFromJSON<Result<void>>,
        get_auction: this.txFromJSON<Result<Auction>>,
        claim_refund: this.txFromJSON<Result<void>>,
        cancel_auction: this.txFromJSON<Result<void>>,
        create_auction: this.txFromJSON<Result<u32>>,
        finalize_auction: this.txFromJSON<Result<void>>,
        get_auction_count: this.txFromJSON<u32>,
        get_pending_refund: this.txFromJSON<i128>
  }
}