import { put } from "@vercel/blob";
import { storagePut } from "./storage";

export async function uploadCatalogImage(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<{ key: string; url: string }> {
  try {
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    const blob = await put(key, new Blob([bytes.buffer], { type: contentType }), {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return { key: blob.pathname, url: blob.url };
  } catch (error) {
    // Keep the Manus storage path available for local WebDev previews that do
    // not have Vercel Blob OIDC credentials. Production uses Vercel Blob once
    // the project is connected to its Blob store.
    if (process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY) {
      console.warn("[Panco image storage] Vercel Blob unavailable; using preview storage fallback.", error);
      return storagePut(key, data, contentType);
    }
    throw error;
  }
}
