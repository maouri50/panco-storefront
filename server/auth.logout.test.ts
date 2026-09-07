import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_COOKIE } from "./adminAuth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("adminAuth.logout", () => {
  it("clears only the independent Panco owner-session cookie", async () => {
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
    const ctx: TrpcContext = {
      admin: { email: "owner@typeitaliano.com" },
      isAdmin: true,
      req: { protocol: "https", headers: { "x-forwarded-proto": "https" } } as TrpcContext["req"],
      res: { clearCookie: (name: string, options: Record<string, unknown>) => clearedCookies.push({ name, options }) } as TrpcContext["res"],
    };

    await expect(appRouter.createCaller(ctx).adminAuth.logout()).resolves.toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]).toMatchObject({ name: ADMIN_SESSION_COOKIE, options: { secure: true, sameSite: "lax", httpOnly: true, path: "/" } });
  });
});
