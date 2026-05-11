import { describe, it, expect } from "vitest";
import { verifyProofBlobShape, type V5ProofBlob } from "../src";

const validBlockProof: V5ProofBlob = {
  l1_superroot: "0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899",
  l2_chain_header: "0x1111111111111111111111111111111111111111111111111111111111111111",
  l3_superroot_proof: [
    "0x2222222222222222222222222222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333333333333333333333333333",
  ],
  l4_block_proof: [
    "0x4444444444444444444444444444444444444444444444444444444444444444",
  ],
  l5_chain_event: null,
  l6_finality_commitment: "0x5555555555555555555555555555555555555555555555555555555555555555",
};

describe("verifyProofBlobShape", () => {
  it("accepts a well-formed block-level blob with l5 nulled", () => {
    expect(verifyProofBlobShape(validBlockProof)).toBe(true);
  });

  it("accepts a tx-level blob with l5 populated as hex", () => {
    const txBlob = { ...validBlockProof, l5_chain_event: "0xdeadbeef" as const };
    expect(verifyProofBlobShape(txBlob)).toBe(true);
  });

  it("rejects blobs with missing or wrong-typed fields", () => {
    expect(verifyProofBlobShape(null)).toBe(false);
    expect(verifyProofBlobShape({})).toBe(false);
    expect(verifyProofBlobShape({ ...validBlockProof, l1_superroot: undefined })).toBe(false);
    expect(verifyProofBlobShape({ ...validBlockProof, l3_superroot_proof: "0xnotanarray" })).toBe(false);
    expect(verifyProofBlobShape({ ...validBlockProof, l4_block_proof: ["missing-prefix"] })).toBe(false);
    expect(verifyProofBlobShape({ ...validBlockProof, l5_chain_event: 42 })).toBe(false);
  });
});
