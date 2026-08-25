export type CashOnDeliveryOrder = {
  orderReference: string;
  productName: string;
  productPrice: string;
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
};

export type NotificationResult = {
  email: "sent" | "not_configured";
  whatsapp: "sent" | "not_configured";
};

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

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
  };
}

export function orderSummary(order: CashOnDeliveryOrder): string {
  return [
    `New Cash on Delivery order — ${order.orderReference}`,
    "",
    `Object: ${order.productName}`,
    `Color: ${order.color}`,
    `Quantity: ${order.quantity}`,
    `Price: ${order.productPrice}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Delivery address: ${order.address}, ${order.city}`,
    order.note ? `Order note: ${order.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendOrderNotifications(
  order: CashOnDeliveryOrder,
  config: NotificationConfig = getNotificationConfig(),
): Promise<NotificationResult> {
  const summary = orderSummary(order);
  let email: NotificationResult["email"] = "not_configured";
  let whatsapp: NotificationResult["whatsapp"] = "not_configured";

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
        html: `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap">${escapeHtml(summary)}</pre>`,
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

  return { email, whatsapp };
}
