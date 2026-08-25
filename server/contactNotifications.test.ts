import { afterEach, describe, expect, it, vi } from "vitest";
import { contactEmailHtml, contactSummary, sendContactNotifications } from "./contactNotifications";

const inquiry = { customerName: "Atlas Test", email: "atlas@example.com", topic: "Care question", message: "How should I care for the leather?" };
const config = {
  resendApiKey: "re_test",
  notificationEmail: "owner@example.com",
  emailFrom: "Panco <onboarding@resend.dev>",
  metaAccessToken: "",
  metaPhoneNumberId: "",
  whatsappDestination: "",
  whatsappTemplateName: "",
  whatsappTemplateLanguage: "en_US",
  metaGraphVersion: "v23.0",
  telegramBotToken: "token",
  telegramChatId: "123",
};

afterEach(() => vi.unstubAllGlobals());

describe("Panco contact notifications", () => {
  it("renders structured owner-facing contact details", () => {
    expect(contactSummary(inquiry)).toContain("Topic: Care question");
    expect(contactEmailHtml(inquiry)).toContain("Atlas Test");
  });

  it("sends the inquiry to configured email and Telegram destinations", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendContactNotifications(inquiry, config)).resolves.toEqual({ email: "sent", telegram: "sent" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("/sendMessage");
  });
});
