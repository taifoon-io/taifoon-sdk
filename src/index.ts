/**
 * @taifoon/sdk — One key for cross-chain proof, gas, signals, executor, registry.
 *
 * Apache 2.0. Adapters you ship using this SDK merge under TSUL via
 * BuildersRegistry; the SDK itself is unrestricted.
 *
 * Status: v0.1.0-pre — scaffold. The first cut targets devnet chain 36927.
 *
 * License: https://github.com/taifoon-io/license/blob/main/APACHE-2.0.md
 * License questions: taifooon@proton.me
 */

export * from "./proof";
export * from "./gas";
export * from "./signals";
export * from "./executor";
export * from "./registry";
export * from "./client";

// Top-level re-exports so `import { TaifoonClient } from "@taifoon/sdk"` works.
export { TaifoonClient } from "./client";
export { fetchProofForBlock, fetchProofForTx, verifyV5Proof, fetchProofBlob, verifyProofBlobShape } from "./proof";
export { GasOracle } from "./gas";
export { Signals, subscribeFills, subscribeIntents } from "./signals";
export { Executor, fillIntent, quoteIntent } from "./executor";
export { BuildersRegistry, claimDonut, submitAdapter } from "./registry";
