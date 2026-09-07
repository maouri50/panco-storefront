import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { AdminSession } from "../adminAuth";
import { getAdminSession } from "../adminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  admin: AdminSession | null;
  isAdmin: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const admin = await getAdminSession(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    admin,
    isAdmin: Boolean(admin),
  };
}
