export type CashOnDeliveryOrder = {
  orderReference: string;
  productName: string;
  productPrice: string;
  productImageUrl: string;
  color: string;
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
};

export type NotificationConfig = {
  resendApiKey: string;
  notificationEmail: string;
  emailFrom: string;
  metaAccessToken: string;
  metaPhoneNumberId: string;
  whatsappDestination: string;
  whatsappTemplateName: string;
  whatsappTemplateLanguage: string;
  metaGraphVersion: string;
  telegramBotToken: string;
  telegramChatId: string;
};

export type NotificationResult = {
  email: "sent" | "not_configured";
  whatsapp: "sent" | "not_configured";
  telegram: "sent" | "not_configured";
};

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function orderTotal(order: Pick<CashOnDeliveryOrder, "productPrice" | "quantity">): string {
  const numericText = order.productPrice.replace(/[^\d.,]/g, "").replace(",", ".");
  const numericPrice = Number(numericText);
  if (!Number.isFinite(numericPrice)) return `${order.productPrice} × ${order.quantity}`;

  const prefix = order.productPrice.match(/^[^\d]+/)?.[0] ?? "";
  const suffix = order.productPrice.match(/[^\d.,]+$/)?.[0] ?? "";
  const total = numericPrice * order.quantity;
  const precision = Number.isInteger(total) ? 0 : 2;
  return `${prefix}${total.toFixed(precision)}${suffix}`;
}

export function getNotificationConfig(): NotificationConfig {
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
    telegramChatId: process.env.TELEGRAM_OWNER_CHAT_ID ?? "",
  };
}

export function orderSummary(order: CashOnDeliveryOrder): string {
  return [
    `New Cash on Delivery order — ${order.orderReference}`,
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
    order.note ? `Order note: ${order.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function orderEmailHtml(order: CashOnDeliveryOrder): string {
  const summary = escapeHtml(orderSummary(order)).replaceAll("\n", "<br />");
  return `<!doctype html><html><body style="margin:0;background:#f6f4ef;color:#1f211f;font-family:Arial,Helvetica,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#53604d">Panco order desk</p><h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:28px;font-weight:500">New Cash on Delivery order</h1><section style="overflow:hidden;border:1px solid #d9d4ca;background:#fff"><img src="${escapeHtml(order.productImageUrl)}" alt="${escapeHtml(order.productName)}" style="display:block;width:100%;max-height:360px;object-fit:cover;background:#ebe7de" /><div style="padding:22px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#53604d">${escapeHtml(order.orderReference)}</p><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;font-weight:500">${escapeHtml(order.productName)}</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><td style="padding:7px 0;color:#6a6a63">Variant</td><td style="padding:7px 0;text-align:right">${escapeHtml(order.color)}</td></tr><tr><td style="padding:7px 0;color:#6a6a63">Quantity</td><td style="padding:7px 0;text-align:right">${order.quantity}</td></tr><tr><td style="padding:7px 0;color:#6a6a63">Unit price</td><td style="padding:7px 0;text-align:right">${escapeHtml(order.productPrice)}</td></tr><tr><td style="padding:10px 0 0;border-top:1px solid #ded9d0;font-weight:700">Order total</td><td style="padding:10px 0 0;border-top:1px solid #ded9d0;text-align:right;font-weight:700">${escapeHtml(orderTotal(order))}</td></tr></table></div></section><section style="margin-top:18px;padding:18px 20px;background:#ece9e1;font-size:14px;line-height:1.6"><strong>Delivery details</strong><br />${summary}</section></main></body></html>`;
}

export function telegramOrderCaption(order: CashOnDeliveryOrder): string {
  const note = order.note ? `\nNote: ${order.note.slice(0, 180)}` : "";
  return [
    `New Cash on Delivery order — ${order.orderReference}`,
    "",
    `Product: ${order.productName}`,
    `Variant: ${order.color}`,
    `Quantity: ${order.quantity}`,
    `Unit price: ${order.productPrice}`,
    `Order total: ${orderTotal(order)}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Delivery: ${order.address}, ${order.city}${note}`,
  ].join("\n").slice(0, 1024);
}

export async function sendOrderNotifications(
  order: CashOnDeliveryOrder,
  config: NotificationConfig = getNotificationConfig(),
): Promise<NotificationResult> {
  const summary = orderSummary(order);
  let email: NotificationResult["email"] = "not_configured";
  let whatsapp: NotificationResult["whatsapp"] = "not_configured";
  let telegram: NotificationResult["telegram"] = "not_configured";

  if (config.resendApiKey && config.notificationEmail) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [config.notificationEmail],
        subject: `New COD order ${order.orderReference} — ${order.productName}`,
        text: summary,
        html: orderEmailHtml(order),
      }),
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
          "Content-Type": "application/json",
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
                  { type: "text", text: `${order.address}, ${order.city}` },
                ],
              },
            ],
          },
        }),
      },
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
        caption: telegramOrderCaption(order),
      }),
    });
    const telegramPayload = await telegramResponse.json().catch(() => null) as { ok?: boolean } | null;

    if (!telegramResponse.ok || !telegramPayload?.ok) {
      throw new Error("The order email was sent, but the Telegram alert could not be sent. Please check the Panco Telegram bot token and owner chat ID.");
    }
    telegram = "sent";
  }

  return { email, whatsapp, telegram };
}
