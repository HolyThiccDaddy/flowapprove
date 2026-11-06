import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Response } from "express";

export const SESSION_COOKIE = "workflow_approval_session";
export const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionCredentials(): { token: string; tokenHash: string; csrfToken: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashSessionToken(token), csrfToken: randomBytes(32).toString("hex") };
}

export function readSessionToken(cookieHeader: string | undefined): string | undefined {
  const prefix = `${SESSION_COOKIE}=`;
  const pair = cookieHeader?.split(";").map((value) => value.trim()).find((value) => value.startsWith(prefix));
  const token = pair?.slice(prefix.length);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : undefined;
}

export function csrfMatches(expected: string, received: string | undefined): boolean {
  if (!received || !/^[a-f0-9]{64}$/.test(expected) || !/^[a-f0-9]{64}$/.test(received)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_LIFETIME_MS,
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
