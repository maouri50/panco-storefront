import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { uploadCatalogImage } = vi.hoisted(() => ({ uploadCatalogImage: vi.fn() }));
vi.mock("./imageStorage", () => ({ uploadCatalogImage }));

function context(isAdmin: boolean): TrpcContext {
  return {
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    admin: isAdmin ? { email: "owner@example.com" } : null,
    isAdmin,
  };
}

describe("catalog image upload", () => {
  beforeEach(() => uploadCatalogImage.mockReset());

  it("rejects visitors before attempting storage", async () => {
    const caller = appRouter.createCaller(context(false));
    await expect(caller.catalog.uploadImage({ fileName: "wallet.jpg", contentType: "image/jpeg", data: "data:image/jpeg;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(uploadCatalogImage).not.toHaveBeenCalled();
  });

  it("stores an admin image in independent Blob storage and returns its public URL", async () => {
    uploadCatalogImage.mockResolvedValue({ key: "panco/catalog/wallet_hash.jpg", url: "https://blob.vercel-storage.com/panco/catalog/wallet_hash.jpg" });
    const caller = appRouter.createCaller(context(true));
    const result = await caller.catalog.uploadImage({ fileName: "Wallet Photo.JPG", contentType: "image/jpeg", data: "data:image/jpeg;base64,aGVsbG8=" });
    expect(result.url).toBe("https://blob.vercel-storage.com/panco/catalog/wallet_hash.jpg");
    expect(uploadCatalogImage).toHaveBeenCalledWith("panco/catalog/wallet-photo.jpg", expect.any(Buffer), "image/jpeg");
  });

  it("rejects a mismatched data URL", async () => {
    const caller = appRouter.createCaller(context(true));
    await expect(caller.catalog.uploadImage({ fileName: "wallet.png", contentType: "image/png", data: "data:image/jpeg;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(uploadCatalogImage).not.toHaveBeenCalled();
  });
});
