/**
 * Example: subscribe to live fill + intent signals from the Spinner Intel layer.
 *
 * Run: tsx examples/subscribe-signals.ts
 */

import { TaifoonClient, subscribeFills, subscribeIntents, Signals } from "../src";

const client = new TaifoonClient({
  apiKey: process.env.TAIFOON_API_KEY,
  chainId: 36927,
});

async function watchFills() {
  console.log("Watching fills...");
  for await (const fill of subscribeFills(client)) {
    const notional = (BigInt(fill.notional) / 1_000_000n).toString();
    console.log(`fill  [${fill.protocol.padEnd(12)}] chain=${fill.chainId} $${notional} USDC  tx=${fill.txHash.slice(0, 10)}...`);
  }
}

async function watchIntents() {
  console.log("Watching intents...");
  for await (const intent of subscribeIntents(client)) {
    const notional = (BigInt(intent.notional) / 1_000_000n).toString();
    const deadline = new Date(intent.deadline * 1000).toISOString();
    console.log(`intent [${intent.intentId.slice(0, 8)}] ${intent.srcChain}→${intent.dstChain} $${notional} USDC  deadline=${deadline}`);
  }
}

async function watchAll() {
  // Subscribe to spread deviations and anomalies in addition to fills/intents
  const signals = new Signals(client);
  for await (const ev of signals.stream(["fill", "intent", "spread_dev", "anomaly"])) {
    console.log(JSON.stringify(ev));
  }
}

// Run fills + intents concurrently
Promise.all([watchFills(), watchIntents()]).catch(e => {
  console.error(e);
  process.exit(1);
});
