import { describe, expect, it } from "vitest";
import { createCashOnDeliveryReference } from "./orderReference";

describe("createCashOnDeliveryReference", () => {
  it("uses the Panco order prefix and a compact uppercase identifier", () => {
    expect(createCashOnDeliveryReference(1_728_000_000_000, "a1b2c3d4-e5f6-7890")).toBe("PA-M1TYL1C0-A1B2");
  });
});
