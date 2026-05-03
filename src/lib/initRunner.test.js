import { describe, expect, it } from "vitest";
import { runInitStep } from "./initRunner";

describe("runInitStep", () => {
  it("collects warning and returns null for non-critical failure", async () => {
    const warnings = [];
    const result = await runInitStep(
      "Domains load failed",
      async () => {
        throw new Error("network timeout");
      },
      warnings
    );

    expect(result).toBeNull();
    expect(warnings).toEqual(["Domains load failed: network timeout"]);
  });

  it("throws for critical failure", async () => {
    const warnings = [];
    await expect(
      runInitStep(
        "User check failed",
        async () => {
          throw new Error("no session");
        },
        warnings,
        { critical: true }
      )
    ).rejects.toThrow("User check failed: no session");
  });
});

