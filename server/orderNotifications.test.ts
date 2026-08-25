import { describe, expect, it, vi } from "vitest";
import { orderTotal, sendOrderNotifications, type CashOnDeliveryOrder, type NotificationConfig } from "./orderNotifications";

const order: CashOnDeliveryOrder = {
  orderReference: "PA-TEST-01",
  productName: "Atlas Card Wallet",
  productPrice: "$78",
  productImageUrl: "https://images.panco.example/atlas-card-wallet.jpg",
  color: "Oxblood",
  quantity: 1,
  customerName: "Test Customer",
  phone: "+212600000000",
  address: "12 Example Street",
  city: "Rabat",
};

const emailOnlyConfig: NotificationConfig = {
  resendApiKey: "resend-test-key",
  notificationEmail: "owner@example.com",
  emailFrom: "Panco <onboarding@resend.dev>",
  metaAccessToken: "",
  metaPhoneNumberId: "",
  whatsappDestination: "",
  whatsappTemplateName: "panco_cod_alert",
  whatsappTemplateLanguage: "en_US",
  metaGraphVersion: "v23.0",
  telegramBotToken: "",
  telegramChatId: "",
};

describe("sendOrderNotifications", () => {
  it("calculates the visible order total from the actual price and quantity", () => {
    expect(orderTotal({ productPrice: "$78", quantity: 2 })).toBe("$156");
  });

  it("sends a structured Resend email and leaves Telegram and WhatsApp inactive without credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendOrderNotifications(order, emailOnlyConfig);

    expect(result).toEqual({ email: "sent", whatsapp: "not_configured", telegram: "not_configured" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer resend-test-key" }) }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body).toMatchObject({
      to: ["owner@example.com"],
      subject: "New COD order PA-TEST-01 — Atlas Card Wallet",
    });
    expect(body.html).toContain('src="https://images.panco.example/atlas-card-wallet.jpg"');
    expect(body.html).toContain("Order total");
    expect(body.html).toContain("$78");
  });

  it("sends an approved Panco utility template when Meta WhatsApp credentials are configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendOrderNotifications(order, {
      ...emailOnlyConfig,
      resendApiKey: "",
      notificationEmail: "",
      metaAccessToken: "meta-test-token",
      metaPhoneNumberId: "123456789",
      whatsappDestination: "+212600000000",
    });

    expect(result).toEqual({ email: "not_configured", whatsapp: "sent", telegram: "not_configured" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v23.0/123456789/messages",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer meta-test-token" }) }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toMatchObject({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "+212600000000",
      type: "template",
      template: {
        name: "panco_cod_alert",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "PA-TEST-01" },
              { type: "text", text: "Atlas Card Wallet" },
              { type: "text", text: "1" },
              { type: "text", text: "Test Customer" },
              { type: "text", text: "+212600000000" },
              { type: "text", text: "12 Example Street, Rabat" },
            ],
          },
        ],
      },
    });
  });

  it("sends the purchased Panco product photo and structured Cash on Delivery details to Telegram", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 101 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendOrderNotifications(order, {
      ...emailOnlyConfig,
      resendApiKey: "",
      notificationEmail: "",
      telegramBotToken: "123456:telegram-test-token",
      telegramChatId: "123456789",
    });

    expect(result).toEqual({ email: "not_configured", whatsapp: "not_configured", telegram: "sent" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123456:telegram-test-token/sendPhoto",
      expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json" } }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toMatchObject({
      chat_id: "123456789",
      photo: "https://images.panco.example/atlas-card-wallet.jpg",
      caption: expect.stringContaining("New Cash on Delivery order — PA-TEST-01"),
    });
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string).caption).toContain("Order total: $78");
  });
});
