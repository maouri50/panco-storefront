import { describe, expect, it } from "vitest";
import { getNotificationConfig, sendOrderNotifications } from "./orderNotifications";

const runApprovedRichAlertTest = process.env.RUN_RICH_ALERT_DELIVERY_TEST === "true";
const approvedIt = runApprovedRichAlertTest ? it : it.skip;

describe("Panco controlled rich alert preview", () => {
  approvedIt("sends one product-photo preview to the configured email and Telegram chat without creating a customer order", async () => {
    const config = getNotificationConfig();
    const result = await sendOrderNotifications(
      {
        orderReference: "PA-ALERT-PREVIEW",
        productName: "Atlas Card Wallet — notification preview only",
        productPrice: "$78",
        productImageUrl: "https://3000-ia9er38s6j3hvae0cns3n-5700966c.us2.manus.computer/manus-storage/north-atelier-cardholder_12ba7095.jpg",
        color: "Oxblood",
        quantity: 2,
        customerName: "Panco order-alert preview",
        phone: "No customer phone",
        address: "No customer address",
        city: "Internal test only",
        note: "Controlled preview of the real product image and purchase details. No customer order was created.",
      },
      {
        ...config,
        metaAccessToken: "",
        metaPhoneNumberId: "",
        whatsappDestination: "",
      },
    );

    expect(result).toEqual({ email: "sent", whatsapp: "not_configured", telegram: "sent" });
  }, 20_000);
});
