import { describe, expect, it } from "vitest";
import { normalizeNewsletterEmail } from "./newsletterStore";
import { newsletterSubscribeInput } from "./newsletterValidation";

describe("Panco newsletter consent validation", () => {
  it("normalizes a consented subscriber email", () => {
    expect(newsletterSubscribeInput.parse({ email: "  OWNER@Example.com ", consent: true })).toEqual({ email: "OWNER@Example.com", consent: true });
    expect(normalizeNewsletterEmail("  OWNER@Example.com ")).toBe("owner@example.com");
  });

  it("rejects signup attempts without explicit consent", () => {
    expect(newsletterSubscribeInput.safeParse({ email: "owner@example.com", consent: false }).success).toBe(false);
  });
});
