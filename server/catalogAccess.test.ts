import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextWithRole(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 7, openId: "catalog-test", email: "catalog@example.com", name: "Catalog Tester", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("catalog admin access", () => {
  it("rejects non-admin catalog access before any catalog data is queried", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.catalog.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
