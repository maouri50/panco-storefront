import { describe, expect, it } from "vitest";
import { catalogProducts, isUsableProductImage, normalizeProductMedia, pancoAssetUrl } from "./catalog";

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

  it("keeps uploaded storage URLs and replaces local computer paths with the primary image", () => {
    const primary = "/manus-storage/panco/catalog/new-wallet.jpg";
    const normalized = normalizeProductMedia({
      slug: "new-wallet",
      name: "New Wallet",
      category: "Small goods",
      price: "$25",
      image: primary,
      gallery: ["C:\\Users\\Owner\\Downloads\\wallet.jpg"],
      swatches: ["#805238"],
      colors: [{ name: "Leather", color: "#805238", image: "C:\\Users\\Owner\\Downloads\\wallet.jpg" }],
      description: "A useful wallet for daily carry.",
      highlights: ["Full-grain leather"],
    });
    expect(pancoAssetUrl(primary)).toBe(primary);
    expect(normalized.gallery).toEqual([primary]);
    expect(normalized.colors[0]?.image).toBe(primary);
    expect(isUsableProductImage("C:\\Users\\Owner\\Downloads\\wallet.jpg")).toBe(false);
    expect(isUsableProductImage(primary)).toBe(true);
  });

  it("adds a studio-selection variant when a managed product has no colors", () => {
    const normalized = normalizeProductMedia({
      slug: "plain-case",
      name: "Plain Case",
      category: "Small goods",
      price: "$25",
      image: "/panco-media/plain-case.jpg",
      gallery: [],
      swatches: ["#222222"],
      colors: [],
      description: "A useful case for daily carry.",
      highlights: ["Full-grain leather"],
    });
    expect(normalized.colors).toEqual([{ name: "Studio selection", color: "#222222", image: "/panco-media/plain-case.jpg" }]);
  });
});
