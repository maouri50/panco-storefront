import { getNotificationConfig, sendOrderNotifications } from "./orderNotifications";
import { describe, expect, it } from "vitest";

const runApprovedBrandedEmailTest = process.env.RUN_BRANDED_EMAIL_DELIVERY_TEST === "true";
const approvedIt = runApprovedBrandedEmailTest ? it : it.skip;

describe("Panco branded email delivery test", () => {
  approvedIt("sends one email-only sender verification without creating an order or Telegram alert", async () => {
    const config = getNotificationConfig();
    const result = await sendOrderNotifications(
      {
        orderReference: "PA-BRANDED-EMAIL-TEST",
        productName: "Panco sender verification — not a customer order",
        productPrice: "$0",
        productImageUrl:
          "https://northshop-zgmh8cdf.manus.space/manus-storage/north-atelier-cardholder_12ba7095.jpg",
        color: "Not applicable",
        quantity: 1,
        customerName: "Panco internal verification",
        phone: "No customer phone",
        address: "No customer address",
        city: "Email-only test",
        note: "Owner-approved branded sender verification. No customer order was created and no Telegram alert was sent.",
      },
      {
        ...config,
        emailFrom: "Panco Orders <orders@typeitaliano.com>",
        metaAccessToken: "",
        metaPhoneNumberId: "",
        whatsappDestination: "",
        telegramBotToken: "",
        telegramChatId: "",
      },
    );

    expect(result).toEqual({ email: "sent", whatsapp: "not_configured", telegram: "not_configured" });
  }, 20_000);
});
