# Contributing to @taifoon/sdk

Apache 2.0. Contributions welcome.

## Setup

```bash
git clone https://github.com/taifoon-io/taifoon-sdk
cd taifoon-sdk
npm install
npm run typecheck
npm test
```

Requires Node 20+.

## Before opening a PR

```bash
npm run typecheck   # zero type errors
npm test            # all tests pass
npm run lint        # zero lint warnings
```

## Adding a module

1. Create `src/<module>/index.ts` — export classes and standalone functions
2. Re-export from `src/index.ts`
3. Add subpath export to `package.json` `exports` field
4. Add at least one test in `tests/<module>.test.ts`
5. Add an example in `examples/` if the API is non-obvious

## Type conventions

- All on-chain addresses and hashes: `` `0x${string}` `` (the `Hex` type)
- All `bigint` values crossing JSON boundaries: `string` (bigint-as-string)
- All amounts: bigint-as-string in the smallest unit (wei for EVM, lamports for Solana)

## License

Apache 2.0. Adapters registered via BuildersRegistry using this SDK are additionally subject to TSUL — see [`taifoon-io/license`](https://github.com/taifoon-io/license). The SDK itself is unrestricted.
