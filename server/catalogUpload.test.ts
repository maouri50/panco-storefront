import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { storagePut } = vi.hoisted(() => ({ storagePut: vi.fn() }));
vi.mock("./storage", () => ({ storagePut }));

function context(isAdmin: boolean): TrpcContext {
  return {
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    admin: isAdmin ? { email: "owner@example.com" } : null,
    isAdmin,
  };
}

describe("catalog image upload", () => {
  beforeEach(() => storagePut.mockReset());

  it("rejects visitors before attempting storage", async () => {
    const caller = appRouter.createCaller(context(false));
    await expect(caller.catalog.uploadImage({ fileName: "wallet.jpg", contentType: "image/jpeg", data: "data:image/jpeg;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("stores an admin image and returns its public storage URL", async () => {
    storagePut.mockResolvedValue({ key: "panco/catalog/wallet_hash.jpg", url: "/manus-storage/panco/catalog/wallet_hash.jpg" });
    const caller = appRouter.createCaller(context(true));
    const result = await caller.catalog.uploadImage({ fileName: "Wallet Photo.JPG", contentType: "image/jpeg", data: "data:image/jpeg;base64,aGVsbG8=" });
    expect(result.url).toBe("/manus-storage/panco/catalog/wallet_hash.jpg");
    expect(storagePut).toHaveBeenCalledWith("panco/catalog/wallet-photo.jpg", expect.any(Buffer), "image/jpeg");
  });

  it("rejects a mismatched data URL", async () => {
    const caller = appRouter.createCaller(context(true));
    await expect(caller.catalog.uploadImage({ fileName: "wallet.png", contentType: "image/png", data: "data:image/jpeg;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(storagePut).not.toHaveBeenCalled();
  });
});
