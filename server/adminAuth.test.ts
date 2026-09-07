import { afterEach, describe, expect, it } from "vitest";
import { getAdminSession, isAdminConfigured, issueAdminSessionToken, verifyAdminCredentials } from "./adminAuth";

const savedEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...savedEnvironment };
});

describe("independent Panco admin authentication", () => {
  it("requires a complete Vercel-only owner configuration and checks both credentials", () => {
    process.env.ADMIN_EMAIL = "owner@typeitaliano.com";
    process.env.ADMIN_PASSWORD = "winter-river-quiet-stone";
    process.env.ADMIN_SESSION_SECRET = "12345678901234567890123456789012";
    expect(isAdminConfigured()).toBe(true);
    expect(verifyAdminCredentials("OWNER@typeitaliano.com", "winter-river-quiet-stone")).toBe(true);
    expect(verifyAdminCredentials("owner@typeitaliano.com", "incorrect-password")).toBe(false);
  });

  it("accepts a current signed owner session and rejects it when the password changes", async () => {
    process.env.ADMIN_EMAIL = "owner@typeitaliano.com";
    process.env.ADMIN_PASSWORD = "winter-river-quiet-stone";
    process.env.ADMIN_SESSION_SECRET = "12345678901234567890123456789012";
    const token = await issueAdminSessionToken(process.env.ADMIN_EMAIL);
    const request = { headers: { cookie: `panco_admin_session=${token}` } } as any;
    await expect(getAdminSession(request)).resolves.toEqual({ email: "owner@typeitaliano.com" });
    process.env.ADMIN_PASSWORD = "another-long-owner-password";
    await expect(getAdminSession(request)).resolves.toBeNull();
  });
});
