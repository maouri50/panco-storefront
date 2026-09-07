import { desc, eq } from "drizzle-orm";
import { newsletterSubscribers } from "../drizzle/schema";
import { getDb } from "./db";

export const normalizeNewsletterEmail = (email: string) => email.trim().toLowerCase();

export async function subscribeToNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  const normalizedEmail = normalizeNewsletterEmail(email);
  const now = new Date();
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1);

  if (existing[0]) {
    await db.update(newsletterSubscribers).set({ status: "subscribed", consentedAt: now, unsubscribedAt: null }).where(eq(newsletterSubscribers.id, existing[0].id));
  } else {
    await db.insert(newsletterSubscribers).values({ email: normalizedEmail, status: "subscribed", consentedAt: now });
  }

  return { email: normalizedEmail, status: "subscribed" as const };
}

export async function listNewsletterSubscribers() {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.consentedAt));
}

export async function unsubscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("The Panco newsletter list is not configured yet.");
  const normalizedEmail = normalizeNewsletterEmail(email);
  await db.update(newsletterSubscribers).set({ status: "unsubscribed", unsubscribedAt: new Date() }).where(eq(newsletterSubscribers.email, normalizedEmail));
  return { email: normalizedEmail, status: "unsubscribed" as const };
}
