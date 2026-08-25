import { describe, expect, it } from "vitest";
import { hasCompleteCodOrderFields } from "./codOrderForm";

describe("hasCompleteCodOrderFields", () => {
  it("accepts the four required Cash on Delivery fields", () => {
    expect(hasCompleteCodOrderFields({ customerName: "Panco test", phone: "+212600000000", address: "12 Studio Street", city: "Rabat" })).toBe(true);
  });

  it("rejects a missing or whitespace-only required field", () => {
    expect(hasCompleteCodOrderFields({ customerName: "Panco test", phone: " ", address: "12 Studio Street", city: "Rabat" })).toBe(false);
  });
});
