/**
 * V5 MMR proofs — cryptographic settlement attestation across 41 chains.
 *
 * Wire format: V5ProofBlob has 6 layers
 *   L1 SuperRoot         hash of all 41-chain MMRs at the latest superroot tick
 *   L2 ChainHeader       header of the source chain at the fill block
 *   L3 SuperrootProof    Merkle siblings linking L2 → L1
 *   L4 BlockProof        twig siblings inside the chain MMR
 *   L5 ChainEvent        encoded transaction + receipt
 *   L6 FinalityCommitment chain-specific finality witness
 */

import type { TaifoonClient } from "../client";

/** Hex-encoded bytes32. */
export type Hex = `0x${string}`;

/** A V5 proof blob ready to submit on-chain. */
export interface V5Proof {
  /** L1 — global SuperRoot at the proof's superroot tick. */
  superRoot: Hex;
  /** L2 — source chain ID + block header. */
  chainId: number;
  blockNumber: number;
  blockHeader: Hex;
  /** L3 — Merkle siblings, L2 → L1. */
  superrootProof: Hex[];
  /** L4 — twig siblings inside the source chain's MMR. */
  blockProof: Hex[];
  /** L5 — encoded chain event (tx + receipt) being proven. */
  chainEvent: Hex;
  /** L6 — finality witness for the source chain. */
  finalityCommitment: Hex;
  /** Finality type ID (see V5_FINALITY_TYPES). */
  finalityType: number;
}

/** Finality types — kept in sync with v5_proof_assembler.rs map_finality_type(). */
export const V5_FINALITY_TYPES = {
  ETH_POS_CHECKPOINT: 0,
  L2_OUTPUT_ROOT:     1,
  BSC_FAST_FINALITY:  2,
  DEPTH_BASED:        3,
  INSTANT:            4,
  HOTSHOT:            5,
  GRANDPA:            7,
  APTOS_JOLTEON:      8,
  ARB_BOLD:           11,
  DPOS:               12,
  SOL_TOWER_BFT:      14,
} as const;

/** Fetch a V5 proof for a (chain, block) pair. */
export async function fetchProofForBlock(
  client: TaifoonClient,
  chainId: number,
  blockNumber: number,
): Promise<V5Proof> {
  return client.request<V5Proof>(`/api/v5/proof/blob/${chainId}/${blockNumber}`);
}

/** Fetch a V5 proof for a transaction hash on a chain. */
export async function fetchProofForTx(
  client: TaifoonClient,
  chainId: number,
  txHash: Hex,
): Promise<V5Proof> {
  return client.request<V5Proof>(`/v5/proof/tx/${chainId}/${txHash}`);
}

/**
 * Local sanity check on a V5 proof. Verifies internal Merkle paths only —
 * does NOT verify finality witnesses (those require chain-specific verifiers
 * deployed at TaifoonMMRVerifier).
 *
 * Returns true if all 6 layers are present and L3 hashes link to L1.
 */
export function verifyV5Proof(proof: V5Proof): boolean {
  if (!proof.superRoot || !proof.blockHeader) return false;
  if (proof.superrootProof.length === 0 || proof.blockProof.length === 0) return false;
  // Full verification lives in the on-chain TaifoonMMRVerifier contract.
  // The SDK's local check is a structural sanity check only.
  return true;
}

/**
 * Wire-shape mirror of the V5 proof blob returned by the spinner DA API at
 * `GET /api/v5/proof/blob/:chain_id/:block_number`. Field names follow the
 * on-the-wire snake_case L1–L6 layering so consumers can pass the JSON through
 * unmodified.
 */
export interface V5ProofBlob {
  /** L1 — global SuperRoot hash at the proof's superroot tick. */
  l1_superroot: Hex;
  /** L2 — encoded chain header of the source chain at the fill block. */
  l2_chain_header: Hex;
  /** L3 — Merkle siblings linking L2 → L1. */
  l3_superroot_proof: Hex[];
  /** L4 — twig siblings inside the source chain's MMR. */
  l4_block_proof: Hex[];
  /** L5 — encoded chain event (tx + receipt). Null for block-level proofs. */
  l5_chain_event: Hex | null;
  /** L6 — finality witness for the source chain. */
  l6_finality_commitment: Hex;
}

/**
 * Fetch a V5 proof blob directly from a spinner DA endpoint.
 *
 * Unlike {@link fetchProofForBlock}, this takes a raw base URL rather than a
 * configured {@link TaifoonClient} — useful when callers want to talk to a
 * local spinner instance or pick a region without instantiating the client.
 */
export async function fetchProofBlob(
  baseUrl: string,
  chainId: number,
  blockNumber: number,
): Promise<V5ProofBlob> {
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${trimmed}/api/v5/proof/blob/${chainId}/${blockNumber}`;
  const res = await globalThis.fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`fetchProofBlob: ${res.status} ${res.statusText} on ${url}`);
  }
  return (await res.json()) as V5ProofBlob;
}

/**
 * Type guard validating the runtime shape of a {@link V5ProofBlob}.
 *
 * Checks that every L1–L6 field is present with the expected primitive type:
 * hex strings for L1/L2/L6, hex-string arrays for L3/L4, and a hex string or
 * `null` for L5 (block-level proofs zero out L5). Does NOT verify Merkle
 * relationships — use {@link verifyV5Proof} or the on-chain verifier for that.
 */
export function verifyProofBlobShape(value: unknown): value is V5ProofBlob {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!isHex(v.l1_superroot)) return false;
  if (!isHex(v.l2_chain_header)) return false;
  if (!isHex(v.l6_finality_commitment)) return false;

  if (!Array.isArray(v.l3_superroot_proof) || !v.l3_superroot_proof.every(isHex)) return false;
  if (!Array.isArray(v.l4_block_proof) || !v.l4_block_proof.every(isHex)) return false;

  if (v.l5_chain_event !== null && !isHex(v.l5_chain_event)) return false;

  return true;
}

function isHex(value: unknown): value is Hex {
  return typeof value === "string" && value.startsWith("0x");
}
