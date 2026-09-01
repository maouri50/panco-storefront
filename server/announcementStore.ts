import { eq } from "drizzle-orm";
import { announcementSettings } from "../drizzle/schema";
import { getDb } from "./db";

export type AnnouncementConfig = {
  enabled: boolean;
  messages: string[];
  backgroundColor: string;
  textColor: string;
  fontStyle: "mono" | "serif" | "sans";
  rotationSeconds: number;
};

export const defaultAnnouncementConfig: AnnouncementConfig = {
  enabled: true,
  messages: ["Cash on Delivery available", "Hand-finished leather goods", "Panco / measured objects"],
  backgroundColor: "#18362a",
  textColor: "#f6f5f2",
  fontStyle: "mono",
  rotationSeconds: 4,
};

const parseMessages = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch { return []; }
};

export async function getAnnouncementConfig(): Promise<AnnouncementConfig> {
  const db = await getDb();
  if (!db) return defaultAnnouncementConfig;
  const [row] = await db.select().from(announcementSettings).where(eq(announcementSettings.id, 1)).limit(1);
  if (!row) return defaultAnnouncementConfig;
  return { enabled: row.enabled, messages: parseMessages(row.messagesJson).slice(0, 12), backgroundColor: row.backgroundColor, textColor: row.textColor, fontStyle: row.fontStyle as AnnouncementConfig["fontStyle"], rotationSeconds: row.rotationSeconds };
}

export async function saveAnnouncementConfig(config: AnnouncementConfig) {
  const db = await getDb();
  if (!db) throw new Error("Announcement settings database is unavailable.");
  const values = { id: 1, enabled: config.enabled, messagesJson: JSON.stringify(config.messages), backgroundColor: config.backgroundColor, textColor: config.textColor, fontStyle: config.fontStyle, rotationSeconds: config.rotationSeconds };
  await db.insert(announcementSettings).values(values).onDuplicateKeyUpdate({ set: values });
  return getAnnouncementConfig();
}
