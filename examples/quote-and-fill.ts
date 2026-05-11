/**
 * Example: get a quote, fetch a V5 proof, fill an intent through the
 * TaifoonUniversalOperator.
 *
 * Run: tsx examples/quote-and-fill.ts
 */

import { TaifoonClient, fetchProofForBlock, quoteIntent, fillIntent } from "../src";

async function main() {
  const client = new TaifoonClient({
    apiKey: process.env.TAIFOON_API_KEY,
    chainId: 36927,
  });

  // 1. Quote a USDC-on-Solana → USDC-on-Base intent
  const quote = await quoteIntent(client, {
    srcChain: 200,                        // Solana network_id
    dstChain: 8453,                       // Base
    tokenIn:  "0xEPjFWdd5...",
    tokenOut: "0x833589fCD6...",
    amountIn: "1000000000",               // 1000 USDC (6 decimals)
    preferAdapter: "mayan",
  });
  console.log("quote", quote);

  // 2. Fetch a V5 proof for the source block where the intent landed
  const proof = await fetchProofForBlock(client, 200, 250_000_000);
  console.log("proof.superRoot", proof.superRoot);

  // 3. Submit the fill — TaifoonUniversalOperator validates the proof
  //    and dispatches to the Mayan adapter. Donut routing fires on settlement.
  const receipt = await fillIntent(client, {
    proof,
    calldata: "0x...",                    // adapter-specific calldata
    adapter:  "mayan",
  });
  console.log("filled", receipt.txHash, "donut event block:", receipt.donutEventBlock);
}

main().catch(e => { console.error(e); process.exit(1); });
