/**
 * Gas oracle clients — chain-specific gas pricing bundled.
 */

import type { TaifoonClient } from "../client";

export interface GasQuote {
  chainId: number;
  /** Base fee in the chain's native unit (wei for EVM). */
  baseFee: bigint;
  /** Suggested priority fee. */
  priorityFee: bigint;
  /** Block number the quote was sampled at. */
  blockNumber: number;
  /** Wall-clock timestamp of the sample. */
  sampledAt: number;
}

export class GasOracle {
  constructor(private readonly client: TaifoonClient) {}

  async quote(chainId: number): Promise<GasQuote> {
    const data = await this.client.request<{
      chain_id: number;
      base_fee: string;
      priority_fee: string;
      block_number: number;
      sampled_at_ms: number;
    }>(`/api/intel/gas/${chainId}`);
    return {
      chainId: data.chain_id,
      baseFee: BigInt(data.base_fee),
      priorityFee: BigInt(data.priority_fee),
      blockNumber: data.block_number,
      sampledAt: data.sampled_at_ms,
    };
  }

  /** Quote multiple chains in one round trip. */
  async quoteMany(chainIds: number[]): Promise<GasQuote[]> {
    return Promise.all(chainIds.map(id => this.quote(id)));
  }
}
