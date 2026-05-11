import { describe, it, expect } from "vitest";
import {
  TaifoonClient,
  V5_FINALITY_TYPES,
  verifyV5Proof,
  Executor,
  GasOracle,
  Signals,
  BuildersRegistry,
} from "../src";

describe("sanity", () => {
  it("constructs the client with sane defaults", () => {
    const c = new TaifoonClient();
    expect(c.chainId).toBe(36927);
    expect(c.apiUrl).toBe("https://api.taifoon.dev");
    expect(c.rpcUrl).toBe("https://rpc.taifoon.dev");
  });

  it("instantiates every module against the same client", () => {
    const c = new TaifoonClient();
    expect(new Executor(c)).toBeInstanceOf(Executor);
    expect(new GasOracle(c)).toBeInstanceOf(GasOracle);
    expect(new Signals(c)).toBeInstanceOf(Signals);
    expect(new BuildersRegistry(c)).toBeInstanceOf(BuildersRegistry);
  });

  it("rejects empty V5 proofs", () => {
    expect(verifyV5Proof({
      superRoot: "0x0",
      chainId: 1,
      blockNumber: 0,
      blockHeader: "0x0",
      superrootProof: [],
      blockProof: [],
      chainEvent: "0x0",
      finalityCommitment: "0x0",
      finalityType: V5_FINALITY_TYPES.INSTANT,
    } as any)).toBe(false);
  });

  it("exposes the canonical finality types", () => {
    expect(V5_FINALITY_TYPES.GRANDPA).toBe(7);
    expect(V5_FINALITY_TYPES.SOL_TOWER_BFT).toBe(14);
    expect(V5_FINALITY_TYPES.ETH_POS_CHECKPOINT).toBe(0);
  });
});
