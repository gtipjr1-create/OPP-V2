import { describe, expect, it } from "vitest";
import { getLocalISODate } from "./date";

describe("getLocalISODate", () => {
  it("returns local YYYY-MM-DD for a provided date", () => {
    const date = new Date(2026, 3, 25, 23, 45, 12);
    expect(getLocalISODate(date)).toBe("2026-04-25");
  });

  it("uses local calendar day (not UTC slice behavior)", () => {
    const date = new Date(2026, 0, 1, 0, 5, 0);
    expect(getLocalISODate(date)).toBe("2026-01-01");
  });
});

