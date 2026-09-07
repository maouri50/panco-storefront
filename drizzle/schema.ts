import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const catalogItems = mysqlTable("catalog_items", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  price: varchar("price", { length: 32 }).notNull(),
  was: varchar("was", { length: 32 }),
  image: text("image").notNull(),
  galleryJson: text("galleryJson").notNull(),
  swatchesJson: text("swatchesJson").notNull(),
  colorsJson: text("colorsJson").notNull(),
  tag: varchar("tag", { length: 80 }),
  description: text("description").notNull(),
  highlightsJson: text("highlightsJson").notNull(),
  published: boolean("published").notNull().default(true),
  displayOrder: int("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("catalog_items_slug_unique").on(table.slug), index("catalog_items_public_order").on(table.published, table.displayOrder)]);

export type CatalogItem = typeof catalogItems.$inferSelect;
export type InsertCatalogItem = typeof catalogItems.$inferInsert;

export const announcementSettings = mysqlTable("announcement_settings", {
  id: int("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  messagesJson: text("messagesJson").notNull(),
  backgroundColor: varchar("backgroundColor", { length: 24 }).notNull().default("#18362a"),
  textColor: varchar("textColor", { length: 24 }).notNull().default("#f6f5f2"),
  fontStyle: varchar("fontStyle", { length: 24 }).notNull().default("mono"),
  rotationSeconds: int("rotationSeconds").notNull().default(4),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnouncementSettings = typeof announcementSettings.$inferSelect;

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["subscribed", "unsubscribed"]).notNull().default("subscribed"),
  consentedAt: timestamp("consentedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("newsletter_subscribers_email_unique").on(table.email), index("newsletter_subscribers_status").on(table.status, table.consentedAt)]);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
