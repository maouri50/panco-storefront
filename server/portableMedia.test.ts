import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mediaRoot = new URL("../client/public/panco-media/", import.meta.url);
const requiredMedia = [
  "north-atelier-cardholder_12ba7095.jpg",
  "north-atelier-hero_6fac9d50.jpg",
  "north-atelier-tote_a6b855c4.jpg",
  "north-atelier-weekender_e238bcf4.webp",
  "north-atelier-workshop_151c4843.jpg",
  "panco-atlas-wallet-angle_284697ca.jpg",
  "panco-atlas-wallet-editorial-final_26f31ab6.jpg",
  "panco-atlas-wallet-interior_26a2cff9.jpg",
  "panco-long-mile-duffle-hero_3cb326bc.jpg",
  "panco-morrow-tote-editorial-final_897513e4.jpg",
  "panco-rook-field-bag-editorial-final_4c404ab1.jpg",
] as const;

describe("portable Panco media", () => {
  it("keeps every customer-facing image inside the deployable project", () => {
    for (const filename of requiredMedia) {
      expect(existsSync(new URL(filename, mediaRoot))).toBe(true);
    }
  });
});
