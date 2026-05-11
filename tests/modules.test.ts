/**
 * Module instantiation and type-shape tests for GasOracle, Executor,
 * BuildersRegistry, and Signals. No network calls — tests are fully offline.
 */

import { describe, it, expect } from "vitest";
import {
  TaifoonClient,
  GasOracle,
  Executor,
  BuildersRegistry,
  Signals,
  fillIntent,
  quoteIntent,
  subscribeFills,
  subscribeIntents,
  claimDonut,
  submitAdapter,
} from "../src";

// --------------------------------------------------------------------------
// GasOracle
// --------------------------------------------------------------------------

describe("GasOracle", () => {
  it("constructs against a client", () => {
    const c = new TaifoonClient();
    expect(new GasOracle(c)).toBeInstanceOf(GasOracle);
  });

  it("exposes quote and quoteMany methods", () => {
    const oracle = new GasOracle(new TaifoonClient());
    expect(typeof oracle.quote).toBe("function");
    expect(typeof oracle.quoteMany).toBe("function");
  });
});

// --------------------------------------------------------------------------
// Executor
// --------------------------------------------------------------------------

describe("Executor", () => {
  it("constructs against a client", () => {
    const c = new TaifoonClient();
    expect(new Executor(c)).toBeInstanceOf(Executor);
  });

  it("exposes quote and fill methods", () => {
    const ex = new Executor(new TaifoonClient());
    expect(typeof ex.quote).toBe("function");
    expect(typeof ex.fill).toBe("function");
  });

  it("fillIntent and quoteIntent are convenience wrappers", () => {
    expect(typeof fillIntent).toBe("function");
    expect(typeof quoteIntent).toBe("function");
  });
});

// --------------------------------------------------------------------------
// BuildersRegistry
// --------------------------------------------------------------------------

describe("BuildersRegistry", () => {
  it("constructs against a client", () => {
    const c = new TaifoonClient();
    expect(new BuildersRegistry(c)).toBeInstanceOf(BuildersRegistry);
  });

  it("exposes claimable, bounty, and calldata builder methods", () => {
    const reg = new BuildersRegistry(new TaifoonClient());
    expect(typeof reg.claimable).toBe("function");
    expect(typeof reg.bounty).toBe("function");
    expect(typeof reg.buildClaimCalldata).toBe("function");
    expect(typeof reg.buildSubmitAdapterCalldata).toBe("function");
  });

  it("claimDonut and submitAdapter are module-level convenience wrappers", () => {
    expect(typeof claimDonut).toBe("function");
    expect(typeof submitAdapter).toBe("function");
  });
});

// --------------------------------------------------------------------------
// Signals
// --------------------------------------------------------------------------

describe("Signals", () => {
  it("constructs against a client", () => {
    const c = new TaifoonClient();
    expect(new Signals(c)).toBeInstanceOf(Signals);
  });

  it("exposes stream async generator method", () => {
    const sigs = new Signals(new TaifoonClient());
    expect(typeof sigs.stream).toBe("function");
  });

  it("subscribeFills and subscribeIntents are convenience wrappers", () => {
    expect(typeof subscribeFills).toBe("function");
    expect(typeof subscribeIntents).toBe("function");
  });
});

// --------------------------------------------------------------------------
// TaifoonClient — custom config
// --------------------------------------------------------------------------

describe("TaifoonClient — custom config", () => {
  it("accepts devnet chainId override", () => {
    const c = new TaifoonClient({ chainId: 36927 });
    expect(c.chainId).toBe(36927);
  });

  it("accepts custom apiUrl and rpcUrl", () => {
    const c = new TaifoonClient({
      apiUrl: "https://staging.taifoon.dev",
      rpcUrl: "https://rpc-staging.taifoon.dev",
    });
    expect(c.apiUrl).toBe("https://staging.taifoon.dev");
    expect(c.rpcUrl).toBe("https://rpc-staging.taifoon.dev");
  });
});
