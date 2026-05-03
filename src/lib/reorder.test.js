import { describe, expect, it } from "vitest";
import { reorderByIds } from "./reorder";

describe("reorderByIds", () => {
  it("reorders items using id order", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
      { id: "c", value: 3 },
    ];

    const result = reorderByIds(items, ["c", "a", "b"]);
    expect(result.map((item) => item.id)).toEqual(["c", "a", "b"]);
  });

  it("throws when reorder list is incomplete", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ];

    expect(() => reorderByIds(items, ["b"])).toThrow("Reorder list was incomplete.");
  });
});

