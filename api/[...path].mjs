// server/vercelApiApp.ts
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

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

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

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

// server/catalogStore.ts
import { asc, desc, eq as eq2 } from "drizzle-orm";

// drizzle/schema.ts
import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var catalogItems = mysqlTable(
  "catalog_items",
  {
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
  },
  (table) => [uniqueIndex("catalog_items_slug_unique").on(table.slug), index("catalog_items_public_order").on(table.published, table.displayOrder)]
);
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

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/catalogStore.ts
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
  const rows = publicOnly ? await db.select().from(catalogItems).where(eq2(catalogItems.published, true)).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt)) : await db.select().from(catalogItems).orderBy(asc(catalogItems.displayOrder), desc(catalogItems.createdAt));
  return rows.map(mapCatalogItem);
}
async function createCatalogItem(input) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.insert(catalogItems).values(toValues(input));
  const [created] = await db.select().from(catalogItems).where(eq2(catalogItems.slug, input.slug)).limit(1);
  if (!created) throw new Error("Catalog item could not be created.");
  return mapCatalogItem(created);
}
async function updateCatalogItem(id, input) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.update(catalogItems).set(toValues(input)).where(eq2(catalogItems.id, id));
  const [updated] = await db.select().from(catalogItems).where(eq2(catalogItems.id, id)).limit(1);
  if (!updated) throw new Error("Catalog item could not be updated.");
  return mapCatalogItem(updated);
}
async function deleteCatalogItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Catalog database is unavailable.");
  await db.delete(catalogItems).where(eq2(catalogItems.id, id));
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

// server/orderReference.ts
function createCashOnDeliveryReference(timestamp2 = Date.now(), uuid = crypto.randomUUID()) {
  return `PA-${timestamp2.toString(36).toUpperCase()}-${uuid.slice(0, 4).toUpperCase()}`;
}

// server/announcementStore.ts
import { eq as eq3 } from "drizzle-orm";
var defaultAnnouncementConfig = {
  enabled: true,
  messages: ["Cash on Delivery available", "Hand-finished leather goods", "Panco / measured objects"],
  backgroundColor: "#18362a",
  textColor: "#f6f5f2",
  fontStyle: "mono",
  rotationSeconds: 4
};
var parseMessages = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return [];
  }
};
async function getAnnouncementConfig() {
  const db = await getDb();
  if (!db) return defaultAnnouncementConfig;
  const [row] = await db.select().from(announcementSettings).where(eq3(announcementSettings.id, 1)).limit(1);
  if (!row) return defaultAnnouncementConfig;
  return { enabled: row.enabled, messages: parseMessages(row.messagesJson).slice(0, 12), backgroundColor: row.backgroundColor, textColor: row.textColor, fontStyle: row.fontStyle, rotationSeconds: row.rotationSeconds };
}
async function saveAnnouncementConfig(config) {
  const db = await getDb();
  if (!db) throw new Error("Announcement settings database is unavailable.");
  const values = { id: 1, enabled: config.enabled, messagesJson: JSON.stringify(config.messages), backgroundColor: config.backgroundColor, textColor: config.textColor, fontStyle: config.fontStyle, rotationSeconds: config.rotationSeconds };
  await db.insert(announcementSettings).values(values).onDuplicateKeyUpdate({ set: values });
  return getAnnouncementConfig();
}

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
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  orders: router({
    submitCashOnDelivery: publicProcedure.input(
      z2.object({
        productName: z2.string().min(1).max(120),
        productPrice: z2.string().min(1).max(32),
        productImageUrl: z2.string().url().max(2e3),
        color: z2.string().min(1).max(80),
        quantity: z2.number().int().min(1).max(9),
        customerName: z2.string().trim().min(2).max(120),
        phone: z2.string().trim().min(6).max(40),
        address: z2.string().trim().min(6).max(240),
        city: z2.string().trim().min(2).max(100),
        note: z2.string().trim().max(500).optional()
      })
    ).mutation(async ({ input }) => {
      const orderReference = createCashOnDeliveryReference();
      try {
        const notifications = await sendOrderNotifications({ ...input, orderReference });
        if (notifications.email !== "sent") {
          throw new TRPCError3({
            code: "PRECONDITION_FAILED",
            message: "The order desk is not configured yet. Please try again shortly."
          });
        }
        return { success: true, orderReference, whatsappSent: notifications.whatsapp === "sent" };
      } catch (error) {
        if (error instanceof TRPCError3) throw error;
        console.error("[COD order notification]", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "We could not send your request. Please try again shortly."
        });
      }
    })
  }),
  contact: router({
    submit: publicProcedure.input(z2.object({
      customerName: z2.string().trim().min(2).max(120),
      email: z2.string().trim().email().max(240),
      topic: z2.string().trim().min(2).max(120),
      message: z2.string().trim().min(8).max(3e3)
    })).mutation(async ({ input }) => {
      try {
        const notifications = await sendContactNotifications(input);
        if (notifications.email !== "sent" && notifications.telegram !== "sent") {
          throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "The Panco contact desk is not configured yet. Please try again shortly." });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError3) throw error;
        console.error("[Panco contact notification]", error);
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "We could not send your message. Please try again shortly." });
      }
    })
  }),
  announcements: router({
    publicConfig: publicProcedure.query(() => getAnnouncementConfig()),
    update: adminProcedure.input(announcementInput).mutation(({ input }) => saveAnnouncementConfig(input))
  }),
  catalog: router({
    publicList: publicProcedure.query(() => listCatalogItems(true)),
    adminList: adminProcedure.query(() => listCatalogItems(false)),
    create: adminProcedure.input(catalogInput).mutation(({ input }) => createCatalogItem(input)),
    update: adminProcedure.input(z2.object({ id: z2.number().int().positive(), item: catalogInput })).mutation(({ input }) => updateCatalogItem(input.id, input.item)),
    remove: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteCatalogItem(input.id)),
    importCurrentCatalog: adminProcedure.mutation(() => seedCatalogItems(initialCatalogItems))
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/vercelApiApp.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
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
