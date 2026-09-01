import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { type NextFunction, type Request, type Response } from "express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";

/**
 * Production-only HTTP app for Vercel. This source is bundled into
 * api/[...path].mjs during the Vercel build so every local tRPC dependency is
 * present in the serverless function instead of being resolved at runtime.
 */
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Panco API route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Panco Vercel API] Unhandled error", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "Panco API request failed" });
});

export default app;
