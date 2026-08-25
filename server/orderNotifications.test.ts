import { describe, expect, it, vi } from "vitest";
import { sendOrderNotifications, type CashOnDeliveryOrder, type NotificationConfig } from "./orderNotifications";

const order: CashOnDeliveryOrder = {
  orderReference: "PA-TEST-01",
  productName: "Atlas Card Wallet",
  productPrice: "$78",
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
};

describe("sendOrderNotifications", () => {
  it("sends a structured Resend email and leaves WhatsApp ready but inactive without Meta credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendOrderNotifications(order, emailOnlyConfig);

    expect(result).toEqual({ email: "sent", whatsapp: "not_configured" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer resend-test-key" }) }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toMatchObject({
      to: ["owner@example.com"],
      subject: "New COD order PA-TEST-01 — Atlas Card Wallet",
    });
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

    expect(result).toEqual({ email: "not_configured", whatsapp: "sent" });
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
});
