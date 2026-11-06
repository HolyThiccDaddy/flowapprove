import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type { Express, RequestHandler, Response } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import {
  clearSessionCookie,
  createSessionCredentials,
  csrfMatches,
  hashSessionToken,
  readSessionToken,
  SESSION_LIFETIME_MS,
  setSessionCookie,
} from "./session.js";

type Role = "REQUESTER" | "REVIEWER";
type PublicUser = { id: string; displayName: string; email: string; role: Role };
type AuthContext = { user: PublicUser; csrfToken: string; sessionId: string };

const invalidCredentials = { error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } };
const sessionRequired = { error: { code: "SESSION_REQUIRED", message: "Sign in to continue." } };
const csrfInvalid = { error: { code: "CSRF_INVALID", message: "The request origin or security token is invalid." } };
const uiSafeUser = { id: true, displayName: true, email: true, role: true } as const;
let cachedDummyPasswordHash: Promise<string> | undefined;

function dummyPasswordHash(): Promise<string> {
  cachedDummyPasswordHash ??= argon2.hash(randomBytes(32).toString("hex"), { type: argon2.argon2id });
  return cachedDummyPasswordHash;
}

function fail(response: Response, status: number, code: string, message: string, fields?: Record<string, string>): void {
  response.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}

function validOrigin(origin: string | undefined, uiOrigin: string): boolean {
  return origin === uiOrigin;
}

function validateCredentials(body: unknown): { email: string; password: string } | { fields: Record<string, string> } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { fields: { _form: "Enter an email and password." } };
  }

  const values = body as Record<string, unknown>;
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";
  const fields: Record<string, string> = {};

  if (Object.keys(values).some((key) => key !== "email" && key !== "password")) {
    fields._form = "Only email and password are accepted.";
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Enter a valid email address.";
  }
  if (password.length < 12 || password.length > 128) {
    fields.password = "Password must be 12 to 128 characters.";
  }

  return Object.keys(fields).length ? { fields } : { email, password };
}

async function activeSession(prisma: PrismaClient, token: string): Promise<AuthContext | undefined> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: { select: { ...uiSafeUser, isActive: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) return undefined;
  return {
    sessionId: session.id,
    csrfToken: session.csrfToken,
    user: { id: session.user.id, displayName: session.user.displayName, email: session.user.email, role: session.user.role },
  };
}

function unauthorized(response: Response): void {
  clearSessionCookie(response);
  response.status(401).json(sessionRequired);
}

export function requireSession(prisma: PrismaClient): RequestHandler {
  return async (request, response, next) => {
    const token = readSessionToken(request.headers.cookie);
    if (!token) {
      unauthorized(response);
      return;
    }

    try {
      const auth = await activeSession(prisma, token);
      if (!auth) {
        unauthorized(response);
        return;
      }
      response.locals.auth = auth;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRole(role: Role, ...additionalRoles: Role[]): RequestHandler {
  const allowed = new Set([role, ...additionalRoles]);
  return (_request, response, next) => {
    const auth = (response.locals as { auth?: AuthContext }).auth;
    if (!auth) {
      response.status(401).json(sessionRequired);
      return;
    }
    if (!allowed.has(auth.user.role)) {
      fail(response, 403, "FORBIDDEN", "You are not allowed to perform this action.");
      return;
    }
    next();
  };
}

export function registerSessionRoutes(app: Express, prisma: PrismaClient, uiOrigin: string): void {
  app.post("/api/session", async (request, response, next) => {
    if (!validOrigin(request.get("origin"), uiOrigin)) {
      response.status(403).json(csrfInvalid);
      return;
    }

    const credentials = validateCredentials(request.body);
    if ("fields" in credentials) {
      fail(response, 422, "VALIDATION_FAILED", "Check the highlighted fields.", credentials.fields);
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true, displayName: true, email: true, role: true, isActive: true, passwordHash: true },
      });
      let passwordMatches = false;
      try {
        passwordMatches = await argon2.verify(user?.passwordHash ?? await dummyPasswordHash(), credentials.password);
      } catch {
        passwordMatches = false;
      }
      if (!user || !user.isActive || !passwordMatches) {
        response.status(401).json(invalidCredentials);
        return;
      }

      const issuedAt = new Date();
      const credentialsForSession = createSessionCredentials();
      await prisma.session.create({
        data: {
          tokenHash: credentialsForSession.tokenHash,
          csrfToken: credentialsForSession.csrfToken,
          userId: user.id,
          createdAt: issuedAt,
          expiresAt: new Date(issuedAt.getTime() + SESSION_LIFETIME_MS),
        },
      });
      setSessionCookie(response, credentialsForSession.token);
      response.status(200).json({
        user: { id: user.id, displayName: user.displayName, email: user.email, role: user.role },
        csrfToken: credentialsForSession.csrfToken,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/session", requireSession(prisma), (_request, response) => {
    const auth = (response.locals as { auth: AuthContext }).auth;
    response.status(200).json({ user: auth.user, csrfToken: auth.csrfToken });
  });

  app.delete("/api/session", async (request, response, next) => {
    const token = readSessionToken(request.headers.cookie);
    if (!token) {
      clearSessionCookie(response);
      response.sendStatus(204);
      return;
    }

    try {
      const auth = await activeSession(prisma, token);
      if (!auth) {
        clearSessionCookie(response);
        response.sendStatus(204);
        return;
      }
      if (!validOrigin(request.get("origin"), uiOrigin) || !csrfMatches(auth.csrfToken, request.get("x-csrf-token"))) {
        response.status(403).json(csrfInvalid);
        return;
      }

      await prisma.session.updateMany({
        where: { id: auth.sessionId, revokedAt: null, expiresAt: { gt: new Date() } },
        data: { revokedAt: new Date() },
      });
      clearSessionCookie(response);
      response.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
}
