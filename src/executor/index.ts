/**
 * Executor — TaifoonUniversalOperator client.
 *
 * Every fill is V5-proof-wrapped. No direct adapter calls allowed.
 */

import type { TaifoonClient } from "../client";
import type { Hex, V5Proof } from "../proof";

export interface QuoteRequest {
  srcChain: number;
  dstChain: number;
  /** Token in (source chain) — address as hex. */
  tokenIn: Hex;
  /** Token out (destination chain). */
  tokenOut: Hex;
  /** Amount in, as bigint string. */
  amountIn: string;
  /** Optional preferred adapter (e.g. "mayan", "across"). */
  preferAdapter?: string;
}

export interface RouteQuote {
  adapter: string;
  feeBps: number;
  gasEstimate: string;
  liquidityCost: string;
  estimatedNet: string;
  ttlSeconds: number;
}

export interface FillRequest {
  /** The V5 proof anchoring this fill to a SuperRoot. */
  proof: V5Proof;
  /** Adapter-specific calldata to forward. */
  calldata: Hex;
  /** Adapter slug (must match TaifoonUniversalOperator's registry). */
  adapter: string;
}

export interface FillReceipt {
  txHash: Hex;
  adapter: string;
  valueRouted: string;
  /** The donut event log address — confirms BuildersRegistry.recordRevenueTouch fired. */
  donutEventBlock: number;
}

export class Executor {
  constructor(private readonly client: TaifoonClient) {}

  /** Get a route quote for an intent, picking the max-PnL adapter. */
  async quote(req: QuoteRequest): Promise<RouteQuote> {
    return this.client.request<RouteQuote>("/api/executor/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });
  }

  /** Submit a V5-proof-wrapped fill via TaifoonUniversalOperator. */
  async fill(req: FillRequest): Promise<FillReceipt> {
    return this.client.request<FillReceipt>("/api/executor/fill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });
  }
}

export function fillIntent(client: TaifoonClient, req: FillRequest): Promise<FillReceipt> {
  return new Executor(client).fill(req);
}

export function quoteIntent(client: TaifoonClient, req: QuoteRequest): Promise<RouteQuote> {
  return new Executor(client).quote(req);
}
