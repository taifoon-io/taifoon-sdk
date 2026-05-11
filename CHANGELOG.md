# Changelog

## [Unreleased]

- `0.2.0` — mainnet endpoint wiring for Executor + Registry (devnet 36927 → production universal operator)
- `0.3.0` — Solana adapter pack (Tower BFT finality, Mayan Wormhole side)
- `1.0.0` — production stable, mainnet-ready, npm publish

## [0.1.0-pre.1] — 2026-05-10

All five module clients implemented. Targets Taifoon Devnet 36927.

### Added

- `TaifoonClient` — single configured handle, standard error handling, Bearer auth
- **proof module** (`@taifoon/sdk/proof`):
  - `V5ProofBlob` — wire-format type mirroring `GET /api/v5/proof/blob/:chain_id/:block_number` (L1–L6)
  - `V5Proof` — high-level proof type with named layer fields
  - `fetchProofBlob(baseUrl, chainId, blockNumber)` — raw DA API fetcher (no client required)
  - `fetchProofForBlock` / `fetchProofForTx` — `TaifoonClient`-wrapped proof fetchers
  - `verifyProofBlobShape(value)` — type guard checking all L1–L6 fields at runtime
  - `verifyV5Proof` — structural sanity check (local only; on-chain verification via TaifoonMMRVerifier)
  - `V5_FINALITY_TYPES` — all 14 finality types, kept in sync with `v5_proof_assembler.rs`
- `GasOracle` — chain-specific gas pricing, `quoteMany` for multi-chain round trips
- `Signals` / `subscribeFills` / `subscribeIntents` — SSE stream of 14 market signal kinds
- `Executor` / `fillIntent` / `quoteIntent` — TaifoonUniversalOperator client (V5-proof-wrapped fills)
- `BuildersRegistry` / `claimDonut` / `submitAdapter` — Builders Programme registry client
- Examples: `quote-and-fill.ts`, `subscribe-signals.ts`, `verify-proof.ts`
- Tests: 20 vitest tests (proof shape guard × 3, sanity × 4, module instantiation × 13) — all pass
- CI: typecheck + vitest + gitleaks on every push/PR
