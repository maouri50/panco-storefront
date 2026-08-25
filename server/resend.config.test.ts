import { describe, expect, it } from "vitest";

describe("Resend order notification configuration", () => {
  it("has a Sending-access key shape and a valid owner inbox before a controlled delivery test", () => {
    const apiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

    expect(apiKey).toMatch(/^re_/);
    expect(notificationEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  });
});
