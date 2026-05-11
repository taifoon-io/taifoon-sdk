# @taifoon/sdk

> One key. Five clients. Cross-chain proof, gas, signals, execution, and the BuildersRegistry — under one TypeScript SDK.

[![npm](https://img.shields.io/badge/npm-@taifoon/sdk-3DA5FF)](https://www.npmjs.com/package/@taifoon/sdk)
[![CI](https://github.com/taifoon-io/taifoon-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/taifoon-io/taifoon-sdk/actions/workflows/ci.yml)
[![License Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-B8F500)](./LICENSE)
[![taifoon.io](https://img.shields.io/badge/taifoon.io-builders-E6F0F7)](https://taifoon.io/builders)

**License:** Apache 2.0. Use freely, fork freely. The SDK is a public good — adapters you ship using it merge under TSUL via `BuildersRegistry`, the SDK itself is unrestricted.

---

## Status

`v0.1.0-pre.1` — fully implemented, pre-npm-publish. All five module clients are implemented and 20 tests pass. The package ships to npm as `@taifoon/sdk` once Taifoon Devnet 36927 endpoints stabilise.

---

## Install

```bash
npm install @taifoon/sdk
```

---

## What it exports

```ts
import {
  // Proof — V5 MMR proofs for cross-chain settlement attestation
  V5Proof, fetchProofForBlock, fetchProofForTx, verifyV5Proof,
  // Gas — chain-specific gas oracles
  GasOracle,
  // Signals — 14 market signals from the Spinner Intel layer
  Signals, subscribeFills, subscribeIntents,
  // Executor — TaifoonUniversalOperator client (V5-proof-wrapped fills)
  Executor, fillIntent, quoteIntent,
  // Registry — BuildersRegistry client (claim donut, submit adapters, fetch verdicts)
  BuildersRegistry, claimDonut, submitAdapter,
} from '@taifoon/sdk';
```

Individual sub-path imports are also available:

```ts
import { fetchProofForBlock } from '@taifoon/sdk/proof';
import { GasOracle }          from '@taifoon/sdk/gas';
import { subscribeFills }     from '@taifoon/sdk/signals';
import { fillIntent }         from '@taifoon/sdk/executor';
import { claimDonut }         from '@taifoon/sdk/registry';
```

---

## Quick start

```ts
import { fetchProofForBlock, verifyV5Proof } from '@taifoon/sdk/proof';
import { quoteIntent, fillIntent }           from '@taifoon/sdk/executor';

// Fetch a V5 MMR proof for a block on Ethereum
const proof = await fetchProofForBlock({ chainId: 1, blockNumber: 22_000_000 });
console.log(proof.l1SuperRoot);   // 0x…

// Verify it locally (no trust required)
const ok = verifyV5Proof(proof);
console.log(ok);  // true

// Quote and fill a cross-chain intent
const quote = await quoteIntent({ srcChain: 1, dstChain: 8453, token: 'USDC', amount: '1000' });
const receipt = await fillIntent(quote);
console.log(receipt.fillHash);    // 0x…
```

See `examples/` for runnable end-to-end scripts:
- [`examples/quote-and-fill.ts`](./examples/quote-and-fill.ts) — intent-to-fill with the Executor client
- [`examples/subscribe-signals.ts`](./examples/subscribe-signals.ts) — live SSE signal stream
- [`examples/verify-proof.ts`](./examples/verify-proof.ts) — fetch + verify a V5 block proof

---

## Why one SDK

Five clients, one auth token, one endpoint. Cross-chain proof, gas, signals, execution, and the Builders Programme registry are unified — the same key that fetches a V5 proof can also claim your accrued donut, no separate auth, no separate billing.

---

## Development

```bash
npm ci
npm run build        # tsc → dist/
npm test             # 20 vitest tests
npm run lint         # ESLint 9 + typescript-eslint
npm run typecheck    # tsc --noEmit
```

---

## Roadmap

- [x] `0.1.0` — read-only V5 proof + signals (devnet 36927), Executor + Registry clients
- [ ] `0.2.0` — Solana adapter pack (Tower BFT finality, Mayan Wormhole side)
- [ ] `0.3.0` — zkVM proof verification, off-chain V5 verifier export
- [ ] `1.0.0` — production stable, mainnet-ready

---

## Get involved

- Ship an adapter: [`taifoon.io/builders/bounties`](https://taifoon.io/builders/bounties)
- Watch the OS: [`taifoon.io/os/dispatch`](https://taifoon.io/os/dispatch)
- License: [`taifoon-io/license`](https://github.com/taifoon-io/license)

License or commercial questions: **taifooon@proton.me**.

Part of the Taifoon OS — [taifoon.io](https://taifoon.io).
