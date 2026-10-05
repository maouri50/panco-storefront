import { describe, expect, it } from "vitest";
import { catalogProducts, pancoAssetUrl } from "./catalog";

describe("Panco editorial catalog galleries", () => {
  it("keeps a full-product editorial image first and a three-view gallery for every product", () => {
    expect(catalogProducts).toHaveLength(4);

    for (const product of catalogProducts) {
      expect(product.image).toBe(product.gallery[0]);
      expect(product.gallery).toHaveLength(3);
      expect(new Set(product.gallery).size).toBe(3);
      expect(product.gallery.every((image) => image.startsWith("/panco-media/"))).toBe(true);
    }

    expect(catalogProducts.find((product) => product.slug === "long-mile-duffle")?.gallery[0]).toBe(
      "/panco-media/panco-long-mile-duffle-hero_3cb326bc.jpg",
    );
    expect(catalogProducts.find((product) => product.slug === "atlas-card-wallet")?.gallery[0]).toBe(
      "/panco-media/panco-atlas-wallet-angle_284697ca.jpg",
    );
  });

  it("rewrites legacy Manus media references to the bundled same-site assets", () => {
    expect(pancoAssetUrl("/manus-storage/example.jpg")).toBe("/panco-media/example.jpg");
    expect(pancoAssetUrl("https://northshop-zgmh8cdf.manus.space/manus-storage/example.jpg")).toBe("/panco-media/example.jpg");
  });
});
