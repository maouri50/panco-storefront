import crypto from "node:crypto";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "panco_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export type AdminSession = {
  email: string;
};

const getConfiguration = () => ({
  email: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
  password: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
});

const secretBytes = (value: string) => new TextEncoder().encode(value);
const fingerprint = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const digestEquals = (left: string, right: string) => crypto.timingSafeEqual(
  crypto.createHash("sha256").update(left).digest(),
  crypto.createHash("sha256").update(right).digest(),
);

export function isAdminConfigured() {
  const { email, password, sessionSecret } = getConfiguration();
  return /^\S+@\S+\.\S+$/.test(email) && password.length >= 12 && sessionSecret.length >= 32;
}

export function verifyAdminCredentials(email: string, password: string) {
  if (!isAdminConfigured()) return false;
  const configuration = getConfiguration();
  return digestEquals(email.trim().toLowerCase(), configuration.email)
    && digestEquals(password, configuration.password);
}

export async function issueAdminSessionToken(email: string) {
  const configuration = getConfiguration();
  if (!isAdminConfigured()) throw new Error("Panco admin credentials are not configured.");

  return new SignJWT({
    email: email.trim().toLowerCase(),
    role: "admin",
    passwordVersion: fingerprint(configuration.password),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("panco-admin")
    .setAudience("panco-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretBytes(configuration.sessionSecret));
}

export async function getAdminSession(req: Request): Promise<AdminSession | null> {
  if (!isAdminConfigured()) return null;
  const token = parse(req.headers.cookie ?? "")[ADMIN_SESSION_COOKIE];
  if (!token) return null;

  try {
    const configuration = getConfiguration();
    const { payload } = await jwtVerify(token, secretBytes(configuration.sessionSecret), {
      algorithms: ["HS256"],
      issuer: "panco-admin",
      audience: "panco-admin",
    });
    const email = typeof payload.email === "string" ? payload.email : "";
    const passwordVersion = typeof payload.passwordVersion === "string" ? payload.passwordVersion : "";
    if (payload.role !== "admin" || !email || !digestEquals(email, configuration.email)) return null;
    if (!digestEquals(passwordVersion, fingerprint(configuration.password))) return null;
    return { email };
  } catch {
    return null;
  }
}

function useSecureCookie(req: Request) {
  return process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
}

function cookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: useSecureCookie(req),
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setAdminSession(res: Response, req: Request, email: string) {
  const token = await issueAdminSessionToken(email);
  res.cookie(ADMIN_SESSION_COOKIE, token, { ...cookieOptions(req), maxAge: SESSION_DURATION_SECONDS * 1000 });
}

export function clearAdminSession(res: Response, req: Request) {
  res.clearCookie(ADMIN_SESSION_COOKIE, cookieOptions(req));
}
