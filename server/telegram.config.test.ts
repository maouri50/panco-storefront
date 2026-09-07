import { describe, expect, it } from "vitest";

const canRunTelegramVerification = process.env.RUN_LIVE_TELEGRAM_CONFIG_TEST === "1"
  && /^\d+:[A-Za-z0-9_-]+$/.test(process.env.TELEGRAM_BOT_TOKEN ?? "")
  && /^-?\d+$/.test(process.env.TELEGRAM_OWNER_CHAT_ID ?? "");
const configuredIt = canRunTelegramVerification ? it : it.skip;

describe("Panco Telegram bot configuration", () => {
  configuredIt("validates the configured bot token with Telegram getMe without exposing it", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(10_000) });
    const payload = await response.json() as { ok?: boolean; result?: { is_bot?: boolean } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(payload.result?.is_bot).toBe(true);
  }, 15_000);

  configuredIt("validates the configured owner chat without exposing its identifier", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
    expect(chatId).toMatch(/^-?\d+$/);

    const response = await fetch(`https://api.telegram.org/bot${token}/getChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json() as { ok?: boolean; result?: { type?: string } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(payload.result?.type).toBe("private");
  }, 15_000);
});
