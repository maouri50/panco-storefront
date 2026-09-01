import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("Panco Vercel deployment configuration", () => {
  it("builds the Vite storefront and routes API traffic to the bundled serverless adapter", () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8")) as {
      framework?: string;
      buildCommand?: string;
      outputDirectory?: string;
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(vercelConfig).toMatchObject({
      framework: "vite",
      buildCommand: "pnpm run build:vercel",
      outputDirectory: "dist/public",
    });
    expect(vercelConfig.rewrites).toContainEqual({ source: "/api/:path*", destination: "/api/[...path]" });
    expect(vercelConfig.rewrites).toContainEqual({ source: "/:path*", destination: "/index.html" });
    expect(fs.existsSync(path.join(projectRoot, "server", "vercelApiApp.ts"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "api", "[...path].mjs"))).toBe(true);
  });
});
