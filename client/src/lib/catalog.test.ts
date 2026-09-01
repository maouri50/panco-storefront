import { describe, expect, it } from "vitest";
import { catalogProducts } from "./catalog";

describe("Panco editorial catalog galleries", () => {
  it("keeps a full-product editorial image first and a three-view gallery for every product", () => {
    expect(catalogProducts).toHaveLength(4);

    for (const product of catalogProducts) {
      expect(product.image).toBe(product.gallery[0]);
      expect(product.gallery).toHaveLength(3);
      expect(new Set(product.gallery).size).toBe(3);
      expect(product.gallery.every((image) => image.startsWith("https://northshop-zgmh8cdf.manus.space/manus-storage/"))).toBe(true);
    }

    expect(catalogProducts.find((product) => product.slug === "long-mile-duffle")?.gallery[0]).toBe(
      "https://northshop-zgmh8cdf.manus.space/manus-storage/panco-long-mile-duffle-hero_3cb326bc.jpg",
    );
    expect(catalogProducts.find((product) => product.slug === "atlas-card-wallet")?.gallery[0]).toBe(
      "https://northshop-zgmh8cdf.manus.space/manus-storage/panco-atlas-wallet-angle_284697ca.jpg",
    );
  });
});
