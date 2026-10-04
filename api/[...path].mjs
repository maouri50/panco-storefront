// server/vercelApiApp.ts
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";

// server/routers.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
import { z as z2 } from "zod";

// server/adminAuth.ts
import crypto2 from "node:crypto";
import { parse } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var ADMIN_SESSION_COOKIE = "panco_admin_session";
var SESSION_DURATION_SECONDS = 60 * 60 * 12;
var getConfiguration = () => ({
  email: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
  password: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET ?? ""
});
var secretBytes = (value) => new TextEncoder().encode(value);
var fingerprint = (value) => crypto2.createHash("sha256").update(value).digest("hex");
var digestEquals = (left, right) => crypto2.timingSafeEqual(
  crypto2.createHash("sha256").update(left).digest(),
  crypto2.createHash("sha256").update(right).digest()
);
function getAdminConfigurationStatus() {
  const { email, password, sessionSecret } = getConfiguration();
  return {
    email: /^\S+@\S+\.\S+$/.test(email),
    password: password.length >= 12,
    sessionSecret: sessionSecret.length >= 32
  };
}
function isAdminConfigured() {
  const configuration = getAdminConfigurationStatus();
  return configuration.email && configuration.password && configuration.sessionSecret;
}
function verifyAdminCredentials(email, password) {
  if (!isAdminConfigured()) return false;
  const configuration = getConfiguration();
  return digestEquals(email.trim().toLowerCase(), configuration.email) && digestEquals(password, configuration.password);
}
async function issueAdminSessionToken(email) {
  const configuration = getConfiguration();
  if (!isAdminConfigured()) throw new Error("Panco admin credentials are not configured.");
  return new SignJWT({
    email: email.trim().toLowerCase(),
    role: "admin",
    passwordVersion: fingerprint(configuration.password)
  }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuer("panco-admin").setAudience("panco-admin").setIssuedAt().setExpirationTime(`${SESSION_DURATION_SECONDS}s`).sign(secretBytes(configuration.sessionSecret));
}
async function getAdminSession(req) {
  if (!isAdminConfigured()) return null;
  const token = parse(req.headers.cookie ?? "")[ADMIN_SESSION_COOKIE];
  if (!token) return null;
  try {
    const configuration = getConfiguration();
    const { payload } = await jwtVerify(token, secretBytes(configuration.sessionSecret), {
      algorithms: ["HS256"],
      issuer: "panco-admin",
      audience: "panco-admin"
    });
    const email = typeof payload.email === "string" ? payload.email : "";
    const passwordVersion = typeof payload.passwordVersion === "string" ? payload.passwordVersion : "";
    if (payload.role !== "admin" || !email || !digestEquals(email, configuration.email)) return null;
    if (!digestEquals(passwordVersion, fingerprint(configuration.password))) return null;
    return { email };
  } catch {
    return null;
  }
}
function useSecureCookie(req) {
  return process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
}
function cookieOptions(req) {
  return {
    httpOnly: true,
    secure: useSecureCookie(req),
    sameSite: "lax",
    path: "/"
  };
}
async function setAdminSession(res, req, email) {
  const token = await issueAdminSessionToken(email);
  res.cookie(ADMIN_SESSION_COOKIE, token, { ...cookieOptions(req), maxAge: SESSION_DURATION_SECONDS * 1e3 });
}
function clearAdminSession(res, req) {
  res.clearCookie(ADMIN_SESSION_COOKIE, cookieOptions(req));
}

// server/announcementStore.ts
import { eq as eq2 } from "drizzle-orm";

// drizzle/schema.ts
import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var catalogItems = mysqlTable("catalog_items", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [uniqueIndex("catalog_items_slug_unique").on(table.slug), index("catalog_items_public_order").on(table.published, table.displayOrder)]);
var announcementSettings = mysqlTable("announcement_settings", {
  id: int("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  messagesJson: text("messagesJson").notNull(),
  backgroundColor: varchar("backgroundColor", { length: 24 }).notNull().default("#18362a"),
  textColor: varchar("textColor", { length: 24 }).notNull().default("#f6f5f2"),
  fontStyle: varchar("fontStyle", { length: 24 }).notNull().default("mono"),
  rotationSeconds: int("rotationSeconds").notNull().default(4),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["subscribed", "unsubscribed"]).notNull().default("subscribed"),
  consentedAt: timestamp("consentedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [uniqueIndex("newsletter_subscribers_email_unique").on(table.email), index("newsletter_subscribers_status").on(table.status, table.consentedAt)]);

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
function createDatabase(connectionString) {
  const hostname = new URL(connectionString).hostname;
  if (hostname.endsWith(".tidbcloud.com")) {
    return drizzle({
      connection: {
        uri: connectionString,
        ssl: {
          minVersion: "TLSv1.2",
          rejectUnauthorized: true
        }
      }
    });
  }
  return drizzle(connectionString);
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = createDatabase(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// server/announcementStore.ts
var defaultAnnouncementConfig = {
  enabled: true,
  messages: ["Cash on Delivery available", "Hand-finished leather goods", "Panco / measured objects"],
  backgroundColor: "#18362a",
  textColor: "#f6f5f2",
  fontStyle: "mono",
  rotationSeconds: 4
};
var announcementStorageUnavailable = false;
var parseMessages = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return [];
  }
};
async function getAnnouncementConfig() {
  if (announcementStorageUnavailable) return defaultAnnouncementConfig;
  const db = await getDb();
  if (!db) return defaultAnnouncementConfig;
  try {
    const [row] = await db.select().from(announcementSettings).where(eq2(announcementSettings.id, 1)).limit(1);
    if (!row) return defaultAnnouncementConfig;
    return { enabled: row.enabled, messages: parseMessages(row.messagesJson).slice(0, 12), backgroundColor: row.backgroundColor, textColor: row.textColor, fontStyle: row.fontStyle, rotationSeconds: row.rotationSeconds };
  } catch (error) {
    announcementStorageUnavailable = true;
    console.warn("[Announcements] Falling back to the default bar:", error);
    return defaultAnnouncementConfig;
  }
}
async function saveAnnouncementConfig(config) {
  const db = await getDb();
  if (!db) throw new Error("Announcement settings database is unavailable.");
  const values = { id: 1, enabled: config.enabled, messagesJson: JSON.stringify(config.messages), backgroundColor: config.backgroundColor, textColor: config.textColor, fontStyle: config.fontStyle, rotationSeconds: config.rotationSeconds };
  announcementStorageUnavailable = false;
  try {
    await db.insert(announcementSettings).values(values).onDuplicateKeyUpdate({ set: values });
  } catch (error) {
    announcementStorageUnavailable = true;
    throw error;
  }
  return getAnnouncementConfig();
}

// server/catalogStore.ts
import { asc, desc, eq as eq3 } from "drizzle-orm";
var parseArray = (value, fallback) => {
  try {
    const result = JSON.parse(value);
    return Array.isArray(result) ? result : fallback;
  } catch {
    return fallback;
  }
};
var mapCatalogItem = (item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  category: item.category,
  price: item.price,
  was: item.was ?? void 0,
  image: item.image,
  gallery: parseArray(item.galleryJson, [item.image]),
  swatches: parseArray(item.swatchesJson, []),
  colors: parseArray(item.colorsJson, []),
  tag: item.tag ?? void 0,
  description: item.description,
  highlights: parseArray(item.highlightsJson, []),
  published: item.published,
  displayOrder: item.displayOrder
});
var toValues = (item) => ({
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
  displayOrder: item.displayOrder
});
async function listCatalogItems(publicOnly = false) {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = publicOnly ? await db.select().from(catalogItems).where(eq3(catalogItems.published, true)).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt)) : await db.select().from(catalogItems).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt));
    return rows.map(mapCatalogItem);
  } catch (error) {
    if (publicOnly) {
      console.warn("[Catalog] Public catalog unavailable; returning an empty result:", error);
      return [];
    }
    throw error;
  }
}
async function createCatalogItem(input) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.insert(catalogItems).values(toValues(input));
  const [created] = await db.select().from(catalogItems).where(eq3(catalogItems.slug, input.slug)).limit(1);
  if (!created) throw new Error("Catalog item could not be created.");
  return mapCatalogItem(created);
}
async function updateCatalogItem(id, input) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.update(catalogItems).set(toValues(input)).where(eq3(catalogItems.id, id));
  const [updated] = await db.select().from(catalogItems).where(eq3(catalogItems.id, id)).limit(1);
  if (!updated) throw new Error("Catalog item could not be updated.");
  return mapCatalogItem(updated);
}
async function deleteCatalogItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.delete(catalogItems).where(eq3(catalogItems.id, id));
}
async function seedCatalogItems(items) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  const [existing] = await db.select({ count: catalogItems.id }).from(catalogItems).limit(1);
  if (existing?.count) return listCatalogItems();
  await db.insert(catalogItems).values(items.map(toValues));
  return listCatalogItems();
}

// server/catalogDefaults.ts
var cardholder = "/manus-storage/north-atelier-cardholder_12ba7095.jpg";
var tote = "/manus-storage/north-atelier-tote_a6b855c4.jpg";
var weekender = "/manus-storage/north-atelier-weekender_e238bcf4.webp";
var hero = "/manus-storage/north-atelier-hero_6fac9d50.jpg";
var workshop = "/manus-storage/north-atelier-workshop_151c4843.jpg";
var initialCatalogItems = [
  { slug: "atlas-card-wallet", name: "Atlas Card Wallet", category: "Small leather goods", price: "$78", was: "$92", image: cardholder, gallery: [cardholder, cardholder, cardholder], swatches: ["#66363f", "#352a2a"], colors: [{ name: "Oxblood", color: "#66363f", image: cardholder }, { name: "Night brown", color: "#352a2a", image: cardholder }], tag: "New", description: "A compact wallet cut for the cards, cash, and small routines that stay closest. Light in the hand, softly structured, and finished to improve with use.", highlights: ["Four card slots with a folded bill pocket", "Vegetable-tanned full-grain leather", "Hand-burnished edges and saddle stitching", "Small enough for front-pocket carry"], published: true, displayOrder: 1 },
  { slug: "morrow-tote", name: "Morrow Tote", category: "Daily carry", price: "$248", image: tote, gallery: [tote, workshop, hero], swatches: ["#A45F3D", "#8A593C"], colors: [{ name: "Saddle", color: "#A45F3D", image: tote }, { name: "Umber", color: "#8A593C", image: hero }], description: "A generous everyday tote balanced between soft proportion and uncomplicated utility. Built for a notebook, a layer, and the objects that make a day work.", highlights: ["Magnetic top closure", "Interior hanging pocket", "Comfortable shoulder straps", "Solid brass hardware"], published: true, displayOrder: 2 },
  { slug: "rook-field-bag", name: "Rook Field Bag", category: "Shoulder bag", price: "$186", was: "$214", image: weekender, gallery: [weekender, workshop, cardholder], swatches: ["#A55E33", "#633B22"], colors: [{ name: "Cedar", color: "#A55E33", image: weekender }, { name: "Chestnut", color: "#633B22", image: cardholder }], tag: "Studio edit", description: "A field-sized bag for the things that should be within reach. Its compact silhouette carries the small architecture of a day without asking for attention.", highlights: ["Adjustable shoulder strap", "Front utility pocket", "Soft-lined interior", "Made in a limited workshop run"], published: true, displayOrder: 3 },
  { slug: "long-mile-duffle", name: "Long Mile Duffle", category: "Weekend carry", price: "$320", image: hero, gallery: [hero, workshop, tote], swatches: ["#6D3D24", "#352B22"], colors: [{ name: "Oxhide", color: "#6D3D24", image: hero }, { name: "Dark umber", color: "#352B22", image: tote }], description: "A soft-sided duffle for one good night away or a few days beyond the familiar. Balanced carry, durable zips, and a shape that gets better with every trip.", highlights: ["Wide zip opening", "Removable shoulder strap", "Reinforced leather base", "Cabin-ready proportions"], published: true, displayOrder: 4 }
];

// server/orderNotifications.ts
var escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function orderTotal(order) {
  const numericText = order.productPrice.replace(/[^\d.,]/g, "").replace(",", ".");
  const numericPrice = Number(numericText);
  if (!Number.isFinite(numericPrice)) return `${order.productPrice} \xD7 ${order.quantity}`;
  const prefix = order.productPrice.match(/^[^\d]+/)?.[0] ?? "";
  const suffix = order.productPrice.match(/[^\d.,]+$/)?.[0] ?? "";
  const total = numericPrice * order.quantity;
  const precision = Number.isInteger(total) ? 0 : 2;
  return `${prefix}${total.toFixed(precision)}${suffix}`;
}
function getNotificationConfig() {
  return {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    notificationEmail: process.env.ORDER_NOTIFICATION_EMAIL ?? "",
    emailFrom: process.env.ORDER_NOTIFICATION_FROM ?? "Panco <onboarding@resend.dev>",
    metaAccessToken: process.env.META_WHATSAPP_ACCESS_TOKEN ?? "",
    metaPhoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID ?? "",
    whatsappDestination: process.env.META_WHATSAPP_OWNER_NUMBER ?? "",
    whatsappTemplateName: process.env.META_WHATSAPP_TEMPLATE_NAME ?? "panco_cod_alert",
    whatsappTemplateLanguage: process.env.META_WHATSAPP_TEMPLATE_LANGUAGE ?? "en_US",
    metaGraphVersion: process.env.META_GRAPH_VERSION ?? "v23.0",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    telegramChatId: process.env.TELEGRAM_OWNER_CHAT_ID ?? ""
  };
}
function orderSummary(order) {
  return [
    `New Cash on Delivery order \u2014 ${order.orderReference}`,
    "",
    `Product: ${order.productName}`,
    `Variant: ${order.color}`,
    `Quantity: ${order.quantity}`,
    `Unit price: ${order.productPrice}`,
    `Order total: ${orderTotal(order)}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Delivery address: ${order.address}, ${order.city}`,
    order.note ? `Order note: ${order.note}` : ""
  ].filter(Boolean).join("\n");
}
function orderEmailHtml(order) {
  const summary = escapeHtml(orderSummary(order)).replaceAll("\n", "<br />");
  return `<!doctype html><html><body style="margin:0;background:#f6f4ef;color:#1f211f;font-family:Arial,Helvetica,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#53604d">Panco order desk</p><h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:28px;font-weight:500">New Cash on Delivery order</h1><section style="overflow:hidden;border:1px solid #d9d4ca;background:#fff"><img src="${escapeHtml(order.productImageUrl)}" alt="${escapeHtml(order.productName)}" style="display:block;width:100%;max-height:360px;object-fit:cover;background:#ebe7de" /><div style="padding:22px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#53604d">${escapeHtml(order.orderReference)}</p><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;font-weight:500">${escapeHtml(order.productName)}</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><td style="padding:7px 0;color:#6a6a63">Variant</td><td style="padding:7px 0;text-align:right">${escapeHtml(order.color)}</td></tr><tr><td style="padding:7px 0;color:#6a6a63">Quantity</td><td style="padding:7px 0;text-align:right">${order.quantity}</td></tr><tr><td style="padding:7px 0;color:#6a6a63">Unit price</td><td style="padding:7px 0;text-align:right">${escapeHtml(order.productPrice)}</td></tr><tr><td style="padding:10px 0 0;border-top:1px solid #ded9d0;font-weight:700">Order total</td><td style="padding:10px 0 0;border-top:1px solid #ded9d0;text-align:right;font-weight:700">${escapeHtml(orderTotal(order))}</td></tr></table></div></section><section style="margin-top:18px;padding:18px 20px;background:#ece9e1;font-size:14px;line-height:1.6"><strong>Delivery details</strong><br />${summary}</section></main></body></html>`;
}
function telegramOrderCaption(order) {
  const note = order.note ? `
Note: ${order.note.slice(0, 180)}` : "";
  return [
    `New Cash on Delivery order \u2014 ${order.orderReference}`,
    "",
    `Product: ${order.productName}`,
    `Variant: ${order.color}`,
    `Quantity: ${order.quantity}`,
    `Unit price: ${order.productPrice}`,
    `Order total: ${orderTotal(order)}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Delivery: ${order.address}, ${order.city}${note}`
  ].join("\n").slice(0, 1024);
}
async function sendOrderNotifications(order, config = getNotificationConfig()) {
  const summary = orderSummary(order);
  let email = "not_configured";
  let whatsapp = "not_configured";
  let telegram = "not_configured";
  if (config.resendApiKey && config.notificationEmail) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [config.notificationEmail],
        subject: `New COD order ${order.orderReference} \u2014 ${order.productName}`,
        text: summary,
        html: orderEmailHtml(order)
      })
    });
    if (!emailResponse.ok) {
      throw new Error("The order email could not be sent. Please check the Resend sender and API key.");
    }
    email = "sent";
  }
  if (config.metaAccessToken && config.metaPhoneNumberId && config.whatsappDestination && config.whatsappTemplateName) {
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/${config.metaGraphVersion}/${config.metaPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.metaAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: config.whatsappDestination,
          type: "template",
          template: {
            name: config.whatsappTemplateName,
            language: { code: config.whatsappTemplateLanguage },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.orderReference },
                  { type: "text", text: order.productName },
                  { type: "text", text: String(order.quantity) },
                  { type: "text", text: order.customerName },
                  { type: "text", text: order.phone },
                  { type: "text", text: `${order.address}, ${order.city}` }
                ]
              }
            ]
          }
        })
      }
    );
    if (!whatsappResponse.ok) {
      throw new Error("The order email was sent, but the WhatsApp alert could not be sent. Please check the Meta settings and approved Panco utility template.");
    }
    whatsapp = "sent";
  }
  if (config.telegramBotToken && config.telegramChatId) {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        photo: order.productImageUrl,
        caption: telegramOrderCaption(order)
      })
    });
    const telegramPayload = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || !telegramPayload?.ok) {
      throw new Error("The order email was sent, but the Telegram alert could not be sent. Please check the Panco Telegram bot token and owner chat ID.");
    }
    telegram = "sent";
  }
  return { email, whatsapp, telegram };
}

// server/contactNotifications.ts
var escapeHtml2 = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function contactSummary(inquiry) {
  return [
    "New Panco contact inquiry",
    "",
    `From: ${inquiry.customerName}`,
    `Email: ${inquiry.email}`,
    `Topic: ${inquiry.topic}`,
    "",
    inquiry.message
  ].join("\n");
}
function contactEmailHtml(inquiry) {
  return `<!doctype html><html><body style="margin:0;background:#f6f4ef;color:#1f211f;font-family:Arial,Helvetica,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#53604d">Panco correspondence</p><h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:28px;font-weight:500">New contact inquiry</h1><section style="padding:22px;border:1px solid #d9d4ca;background:#fff"><p style="margin:0 0 5px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6a6a63">${escapeHtml2(inquiry.topic)}</p><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;font-weight:500">${escapeHtml2(inquiry.customerName)}</h2><p style="margin:0 0 18px;color:#53604d">${escapeHtml2(inquiry.email)}</p><p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml2(inquiry.message)}</p></section></main></body></html>`;
}
async function sendContactNotifications(inquiry, config = getNotificationConfig()) {
  const summary = contactSummary(inquiry);
  let email = "not_configured";
  let telegram = "not_configured";
  if (config.resendApiKey && config.notificationEmail) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [config.notificationEmail],
        subject: `Panco contact \u2014 ${inquiry.topic}`,
        text: summary,
        html: contactEmailHtml(inquiry)
      })
    });
    if (!response.ok) throw new Error("The Panco contact email could not be sent.");
    email = "sent";
  }
  if (config.telegramBotToken && config.telegramChatId) {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegramChatId, text: summary })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error("The Panco Telegram contact alert could not be sent.");
    telegram = "sent";
  }
  return { email, telegram };
}

// server/newsletterStore.ts
import { desc as desc2, eq as eq4 } from "drizzle-orm";
var normalizeNewsletterEmail = (email) => email.trim().toLowerCase();
async function subscribeToNewsletter(email) {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  const normalizedEmail = normalizeNewsletterEmail(email);
  const now = /* @__PURE__ */ new Date();
  const existing = await db.select().from(newsletterSubscribers).where(eq4(newsletterSubscribers.email, normalizedEmail)).limit(1);
  if (existing[0]) {
    await db.update(newsletterSubscribers).set({ status: "subscribed", consentedAt: now, unsubscribedAt: null }).where(eq4(newsletterSubscribers.id, existing[0].id));
  } else {
    await db.insert(newsletterSubscribers).values({ email: normalizedEmail, status: "subscribed", consentedAt: now });
  }
  return { email: normalizedEmail, status: "subscribed" };
}
async function listNewsletterSubscribers() {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  return db.select().from(newsletterSubscribers).orderBy(desc2(newsletterSubscribers.consentedAt));
}
async function unsubscribeNewsletter(email) {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  const normalizedEmail = normalizeNewsletterEmail(email);
  await db.update(newsletterSubscribers).set({ status: "unsubscribed", unsubscribedAt: /* @__PURE__ */ new Date() }).where(eq4(newsletterSubscribers.email, normalizedEmail));
  return { email: normalizedEmail, status: "unsubscribed" };
}

// server/newsletterValidation.ts
import { z } from "zod";
var newsletterSubscribeInput = z.object({
  email: z.string().trim().email().max(320),
  consent: z.literal(true)
});
var newsletterEmailInput = z.object({
  email: z.string().trim().email().max(320)
});

// server/orderReference.ts
function createCashOnDeliveryReference(timestamp2 = Date.now(), uuid = crypto.randomUUID()) {
  return `PA-${timestamp2.toString(36).toUpperCase()}-${uuid.slice(0, 4).toUpperCase()}`;
}

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.isAdmin) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx });
  })
);

// server/routers.ts
var catalogInput = z2.object({
  slug: z2.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  name: z2.string().trim().min(2).max(160),
  category: z2.string().trim().min(2).max(120),
  price: z2.string().trim().min(1).max(32),
  was: z2.string().trim().max(32).optional(),
  image: z2.string().trim().min(1).max(2e3),
  gallery: z2.array(z2.string().trim().min(1).max(2e3)).min(1).max(8),
  swatches: z2.array(z2.string().trim().max(32)).max(8),
  colors: z2.array(z2.object({ name: z2.string().trim().min(1).max(80), color: z2.string().trim().min(1).max(32), image: z2.string().trim().min(1).max(2e3) })).max(8),
  tag: z2.string().trim().max(80).optional(),
  description: z2.string().trim().min(12).max(2e3),
  highlights: z2.array(z2.string().trim().min(1).max(240)).min(1).max(12),
  published: z2.boolean(),
  displayOrder: z2.number().int().min(0).max(9999)
});
var announcementInput = z2.object({
  enabled: z2.boolean(),
  messages: z2.array(z2.string().trim().min(1).max(120)).min(1).max(12),
  backgroundColor: z2.string().regex(/^#[0-9a-fA-F]{6}$/),
  textColor: z2.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontStyle: z2.enum(["mono", "serif", "sans"]),
  rotationSeconds: z2.number().int().min(2).max(20)
});
var appRouter = router({
  adminAuth: router({
    status: publicProcedure.query(({ ctx }) => ({ configured: isAdminConfigured(), configuration: getAdminConfigurationStatus(), signedIn: ctx.isAdmin, email: ctx.admin?.email ?? null })),
    login: publicProcedure.input(z2.object({ email: z2.string().trim().email().max(320), password: z2.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      if (!isAdminConfigured()) throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Owner sign-in is not configured in Vercel yet." });
      if (!verifyAdminCredentials(input.email, input.password)) throw new TRPCError2({ code: "UNAUTHORIZED", message: "The email or password is incorrect." });
      await setAdminSession(ctx.res, ctx.req, input.email);
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.res, ctx.req);
      return { success: true };
    })
  }),
  orders: router({
    submitCashOnDelivery: publicProcedure.input(z2.object({ productName: z2.string().min(1).max(120), productPrice: z2.string().min(1).max(32), productImageUrl: z2.string().url().max(2e3), color: z2.string().min(1).max(80), quantity: z2.number().int().min(1).max(9), customerName: z2.string().trim().min(2).max(120), phone: z2.string().trim().min(6).max(40), address: z2.string().trim().min(6).max(240), city: z2.string().trim().min(2).max(100), note: z2.string().trim().max(500).optional() })).mutation(async ({ input }) => {
      const orderReference = createCashOnDeliveryReference();
      try {
        const notifications = await sendOrderNotifications({ ...input, orderReference });
        if (notifications.email !== "sent") throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "The order desk is not configured yet. Please try again shortly." });
        return { success: true, orderReference, whatsappSent: notifications.whatsapp === "sent" };
      } catch (error) {
        if (error instanceof TRPCError2) throw error;
        console.error("[COD order notification]", error);
        throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "We could not send your request. Please try again shortly." });
      }
    })
  }),
  contact: router({
    submit: publicProcedure.input(z2.object({ customerName: z2.string().trim().min(2).max(120), email: z2.string().trim().email().max(240), topic: z2.string().trim().min(2).max(120), message: z2.string().trim().min(8).max(3e3) })).mutation(async ({ input }) => {
      try {
        const notifications = await sendContactNotifications(input);
        if (notifications.email !== "sent" && notifications.telegram !== "sent") throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "The Panco contact desk is not configured yet. Please try again shortly." });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError2) throw error;
        console.error("[Panco contact notification]", error);
        throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "We could not send your message. Please try again shortly." });
      }
    })
  }),
  newsletter: router({
    subscribe: publicProcedure.input(newsletterSubscribeInput).mutation(({ input }) => subscribeToNewsletter(input.email)),
    adminList: adminProcedure.query(() => listNewsletterSubscribers()),
    adminUnsubscribe: adminProcedure.input(newsletterEmailInput).mutation(({ input }) => unsubscribeNewsletter(input.email))
  }),
  announcements: router({ publicConfig: publicProcedure.query(() => getAnnouncementConfig()), update: adminProcedure.input(announcementInput).mutation(({ input }) => saveAnnouncementConfig(input)) }),
  catalog: router({
    publicList: publicProcedure.query(() => listCatalogItems(true)),
    adminList: adminProcedure.query(() => listCatalogItems(false)),
    create: adminProcedure.input(catalogInput).mutation(({ input }) => createCatalogItem(input)),
    update: adminProcedure.input(z2.object({ id: z2.number().int().positive(), item: catalogInput })).mutation(({ input }) => updateCatalogItem(input.id, input.item)),
    remove: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteCatalogItem(input.id)),
    importCurrentCatalog: adminProcedure.mutation(() => seedCatalogItems(initialCatalogItems))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  const admin = await getAdminSession(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    admin,
    isAdmin: Boolean(admin)
  };
}

// server/vercelApiApp.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Panco API route not found" });
});
app.use((error, _req, res, _next) => {
  console.error("[Panco Vercel API] Unhandled error", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "Panco API request failed" });
});
var vercelApiApp_default = app;
export {
  vercelApiApp_default as default
};
