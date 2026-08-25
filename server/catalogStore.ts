import { asc, desc, eq } from "drizzle-orm";
import { catalogItems, type CatalogItem, type InsertCatalogItem } from "../drizzle/schema";
import { getDb } from "./db";

export type CatalogColor = { name: string; color: string; image: string };
export type CatalogInput = {
  slug: string;
  name: string;
  category: string;
  price: string;
  was?: string;
  image: string;
  gallery: string[];
  swatches: string[];
  colors: CatalogColor[];
  tag?: string;
  description: string;
  highlights: string[];
  published: boolean;
  displayOrder: number;
};

const parseArray = <T>(value: string, fallback: T[]): T[] => {
  try {
    const result = JSON.parse(value);
    return Array.isArray(result) ? (result as T[]) : fallback;
  } catch {
    return fallback;
  }
};

export const mapCatalogItem = (item: CatalogItem): CatalogInput & { id: number } => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  category: item.category,
  price: item.price,
  was: item.was ?? undefined,
  image: item.image,
  gallery: parseArray<string>(item.galleryJson, [item.image]),
  swatches: parseArray<string>(item.swatchesJson, []),
  colors: parseArray<CatalogColor>(item.colorsJson, []),
  tag: item.tag ?? undefined,
  description: item.description,
  highlights: parseArray<string>(item.highlightsJson, []),
  published: item.published,
  displayOrder: item.displayOrder,
});

const toValues = (item: CatalogInput): InsertCatalogItem => ({
  slug: item.slug,
  name: item.name,
  category: item.category,
  price: item.price,
  was: item.was ?? null,
  image: item.image,
  galleryJson: JSON.stringify(item.gallery),
  swatchesJson: JSON.stringify(item.swatches),
  colorsJson: JSON.stringify(item.colors),
  tag: item.tag ?? null,
  description: item.description,
  highlightsJson: JSON.stringify(item.highlights),
  published: item.published,
  displayOrder: item.displayOrder,
});

export async function listCatalogItems(publicOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const rows = publicOnly
    ? await db.select().from(catalogItems).where(eq(catalogItems.published, true)).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt))
    : await db.select().from(catalogItems).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt));
  return rows.map(mapCatalogItem);
}

export async function createCatalogItem(input: CatalogInput) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.insert(catalogItems).values(toValues(input));
  const [created] = await db.select().from(catalogItems).where(eq(catalogItems.slug, input.slug)).limit(1);
  if (!created) throw new Error("Catalog item could not be created.");
  return mapCatalogItem(created);
}

export async function updateCatalogItem(id: number, input: CatalogInput) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.update(catalogItems).set(toValues(input)).where(eq(catalogItems.id, id));
  const [updated] = await db.select().from(catalogItems).where(eq(catalogItems.id, id)).limit(1);
  if (!updated) throw new Error("Catalog item could not be updated.");
  return mapCatalogItem(updated);
}

export async function deleteCatalogItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.delete(catalogItems).where(eq(catalogItems.id, id));
}

export async function seedCatalogItems(items: CatalogInput[]) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  const [existing] = await db.select({ count: catalogItems.id }).from(catalogItems).limit(1);
  if (existing?.count) return listCatalogItems();
  await db.insert(catalogItems).values(items.map(toValues));
  return listCatalogItems();
}
