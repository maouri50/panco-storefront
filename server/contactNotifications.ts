import { getNotificationConfig, type NotificationConfig } from "./orderNotifications";

export type ContactInquiry = {
  customerName: string;
  email: string;
  topic: string;
  message: string;
};

export type ContactNotificationResult = {
  email: "sent" | "not_configured";
  telegram: "sent" | "not_configured";
};

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function contactSummary(inquiry: ContactInquiry) {
  return [
    "New Panco contact inquiry",
    "",
    `From: ${inquiry.customerName}`,
    `Email: ${inquiry.email}`,
    `Topic: ${inquiry.topic}`,
    "",
    inquiry.message,
  ].join("\n");
}

export function contactEmailHtml(inquiry: ContactInquiry) {
  return `<!doctype html><html><body style="margin:0;background:#f6f4ef;color:#1f211f;font-family:Arial,Helvetica,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#53604d">Panco correspondence</p><h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:28px;font-weight:500">New contact inquiry</h1><section style="padding:22px;border:1px solid #d9d4ca;background:#fff"><p style="margin:0 0 5px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6a6a63">${escapeHtml(inquiry.topic)}</p><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;font-weight:500">${escapeHtml(inquiry.customerName)}</h2><p style="margin:0 0 18px;color:#53604d">${escapeHtml(inquiry.email)}</p><p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(inquiry.message)}</p></section></main></body></html>`;
}

export async function sendContactNotifications(
  inquiry: ContactInquiry,
  config: NotificationConfig = getNotificationConfig(),
): Promise<ContactNotificationResult> {
  const summary = contactSummary(inquiry);
  let email: ContactNotificationResult["email"] = "not_configured";
  let telegram: ContactNotificationResult["telegram"] = "not_configured";

  if (config.resendApiKey && config.notificationEmail) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [config.notificationEmail],
        subject: `Panco contact — ${inquiry.topic}`,
        text: summary,
        html: contactEmailHtml(inquiry),
      }),
    });
    if (!response.ok) throw new Error("The Panco contact email could not be sent.");
    email = "sent";
  }

  if (config.telegramBotToken && config.telegramChatId) {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegramChatId, text: summary }),
    });
    const payload = await response.json().catch(() => null) as { ok?: boolean } | null;
    if (!response.ok || !payload?.ok) throw new Error("The Panco Telegram contact alert could not be sent.");
    telegram = "sent";
  }

  return { email, telegram };
}
