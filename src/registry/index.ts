/**
 * BuildersRegistry — claim donut, submit adapters, fetch verdicts.
 *
 * The registry is the on-chain enforcement of TSUL rule #4:
 * 49 bps of every settled call routes 70/20/10 to creator/reviewers/ecosystem.
 *
 * Devnet 36927 address: 0xa2c0dd0c68cb38b357a51790cf572a7264f98cf0
 */

import type { TaifoonClient } from "../client";
import type { Hex } from "../proof";

export interface BountyInfo {
  bountyId: string;
  status: "OPEN" | "CLAIMED" | "SUBMITTED" | "REVIEWING" | "MERGED" | "BLOCKED";
  creatorSliceBps: number;
  volumeClass: "S" | "A" | "B" | "C" | "ALL";
  reviewers: string[];
  mergedAt?: string;
}

export interface ClaimableState {
  wallet: Hex;
  /** Total accrued across all merged contributions, as bigint string. */
  totalAccrued: string;
  /** Per-bounty breakdown. */
  byBounty: Array<{
    bountyId: string;
    accrued: string;
    lastTouchBlock: number;
  }>;
}

export class BuildersRegistry {
  constructor(private readonly client: TaifoonClient) {}

  /** Read claimable donut for a wallet. */
  async claimable(wallet: Hex): Promise<ClaimableState> {
    return this.client.request<ClaimableState>(`/api/registry/claimable/${wallet}`);
  }

  /** Read a bounty's current state. */
  async bounty(bountyId: string): Promise<BountyInfo> {
    return this.client.request<BountyInfo>(`/api/registry/bounty/${bountyId}`);
  }

  /**
   * Returns the calldata required to call BuildersRegistry.claim() for the
   * wallet. The caller signs + broadcasts; the SDK does not custody keys.
   */
  async buildClaimCalldata(wallet: Hex): Promise<{ to: Hex; data: Hex }> {
    return this.client.request<{ to: Hex; data: Hex }>(`/api/registry/claim-tx/${wallet}`);
  }

  /**
   * Returns the calldata required to call BuildersRegistry.submitAdapter()
   * for a (bountyId, adapterHash, manifest) tuple. Caller signs + broadcasts.
   */
  async buildSubmitAdapterCalldata(args: {
    bountyId: string;
    adapterHash: Hex;
    manifestUri: string;
  }): Promise<{ to: Hex; data: Hex }> {
    return this.client.request<{ to: Hex; data: Hex }>("/api/registry/submit-adapter-tx", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args),
    });
  }
}

/** Convenience: build the claim() calldata for a wallet. */
export function claimDonut(client: TaifoonClient, wallet: Hex) {
  return new BuildersRegistry(client).buildClaimCalldata(wallet);
}

/** Convenience: build the submitAdapter() calldata. */
export function submitAdapter(
  client: TaifoonClient,
  args: { bountyId: string; adapterHash: Hex; manifestUri: string },
) {
  return new BuildersRegistry(client).buildSubmitAdapterCalldata(args);
}
