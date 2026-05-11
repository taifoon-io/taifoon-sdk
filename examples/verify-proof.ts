/**
 * Example: fetch and verify a V5 MMR proof for a block.
 *
 * Run: tsx examples/verify-proof.ts
 */

import { TaifoonClient, fetchProofBlob, verifyProofBlobShape, verifyV5Proof, V5_FINALITY_TYPES } from "../src";

async function main() {
  const client = new TaifoonClient({
    apiKey: process.env.TAIFOON_API_KEY,
    chainId: 36927,
  });

  // Chain IDs: 1 (Ethereum), 56 (BSC), 8453 (Base), 42161 (Arbitrum), 200 (Solana)
  const chainId = parseInt(process.env.CHAIN_ID ?? "1");
  const blockNumber = parseInt(process.env.BLOCK_NUMBER ?? "21000000");

  console.log(`Fetching V5 proof for chain=${chainId} block=${blockNumber}…`);

  // 1. Fetch the raw wire-format blob
  const blob = await fetchProofBlob(client.apiUrl, chainId, blockNumber);

  // 2. Verify shape (all L1–L6 fields present and correctly typed)
  if (!verifyProofBlobShape(blob)) {
    throw new Error("Proof blob failed shape validation");
  }
  console.log("Shape valid ✓");
  console.log(`  L1 superroot:          ${blob.l1_superroot.slice(0, 18)}…`);
  console.log(`  L2 chain header:       ${blob.l2_chain_header.slice(0, 18)}…`);
  console.log(`  L3 siblings:           ${blob.l3_superroot_proof.length} node(s)`);
  console.log(`  L4 block proof:        ${blob.l4_block_proof.length} node(s)`);
  console.log(`  L5 chain event:        ${blob.l5_chain_event ? "populated" : "null (block-level)"}`);
  console.log(`  L6 finality commit:    ${blob.l6_finality_commitment.slice(0, 18)}…`);

  // 3. Fetch high-level proof object and run structural sanity check
  const proof = await client.request<any>(`/api/v5/proof/blob/${chainId}/${blockNumber}`);
  const sane = verifyV5Proof(proof as any);
  console.log(`Structural sanity: ${sane ? "passed ✓" : "FAILED ✗"}`);

  // 4. Print finality type
  const ftName = Object.entries(V5_FINALITY_TYPES).find(([, v]) => v === proof?.finalityType)?.[0] ?? "unknown";
  console.log(`Finality type:     ${ftName} (${proof?.finalityType})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
