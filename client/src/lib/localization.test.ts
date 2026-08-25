import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/contexts/LocaleContext";
import { localizeProduct } from "@/lib/localization";
import { catalogProducts } from "@/lib/catalog";

describe("Arabic locale helpers", () => {
  it("defaults unsupported stored locales to English", () => {
    expect(normalizeLocale("fr")).toBe("en");
    expect(normalizeLocale("ar")).toBe("ar");
  });

  it("keeps the catalog structure while supplying Arabic product labels", () => {
    const localized = localizeProduct(catalogProducts[0], "ar");
    expect(localized.slug).toBe("atlas-card-wallet");
    expect(localized.name).toBe("محفظة أطلس للبطاقات");
    expect(localized.colors[0]?.name).toBe("خمري داكن");
  });
});
