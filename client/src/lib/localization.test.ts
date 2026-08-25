import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/contexts/LocaleContext";
import { homeCopy, localizeProduct } from "@/lib/localization";
import { catalogProducts } from "@/lib/catalog";

describe("Locale helpers", () => {
  it("defaults missing or unsupported stored locales to English", () => {
    expect(normalizeLocale(null)).toBe("en");
    expect(normalizeLocale("de")).toBe("en");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("ar")).toBe("ar");
    expect(normalizeLocale("fr")).toBe("fr");
  });

  it("keeps the catalog structure while supplying Arabic product labels", () => {
    const localized = localizeProduct(catalogProducts[0], "ar");
    expect(localized.slug).toBe("atlas-card-wallet");
    expect(localized.name).toBe("محفظة أطلس للبطاقات");
    expect(localized.colors[0]?.name).toBe("خمري داكن");
    expect(localizeProduct(catalogProducts[0], "fr").name).toBe("Porte-cartes Atlas");
  });

  it("keeps the requested English shop heading on one line without changing localized editorial breaks", () => {
    expect(homeCopy.en.everyday).toBe("Objects for the everyday.");
    expect(homeCopy.fr.everyday).toContain("\n");
    expect(homeCopy.ar.everyday).toContain("\n");
  });
});
