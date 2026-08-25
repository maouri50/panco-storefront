import { describe, expect, it } from "vitest";
import { getNotificationConfig, sendOrderNotifications } from "./orderNotifications";

const runApprovedDeliveryTest = process.env.RUN_TELEGRAM_DELIVERY_TEST === "true";
const approvedIt = runApprovedDeliveryTest ? it : it.skip;

describe("Panco controlled Telegram delivery", () => {
  approvedIt("sends one clearly marked test alert without sending email or creating a customer order", async () => {
    const config = getNotificationConfig();
    const result = await sendOrderNotifications(
      {
        orderReference: "PA-TELEGRAM-TEST",
        productName: "Telegram alert validation — not a customer order",
        productPrice: "N/A",
        color: "Test only",
        quantity: 0,
        customerName: "Panco notification check",
        phone: "No customer phone",
        address: "No customer address",
        city: "Internal test",
        note: "Controlled Telegram notification test. No customer order was created.",
      },
      {
        ...config,
        resendApiKey: "",
        notificationEmail: "",
        metaAccessToken: "",
        metaPhoneNumberId: "",
        whatsappDestination: "",
      },
    );

    expect(result).toEqual({ email: "not_configured", whatsapp: "not_configured", telegram: "sent" });
  }, 15_000);
});
