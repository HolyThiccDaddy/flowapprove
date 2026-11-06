import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  SESSION_COOKIE,
  createSessionCredentials,
  csrfMatches,
  hashSessionToken,
  readSessionToken,
} from "../src/auth/session.js";
import { requireRole } from "../src/auth/routes.js";

describe("session credentials", () => {
  it("creates an opaque token, stores only its SHA-256 digest, and binds a separate CSRF token", () => {
    const credentials = createSessionCredentials();

    expect(credentials.token).toMatch(/^[a-f0-9]{64}$/);
    expect(credentials.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(credentials.csrfToken).not.toBe(credentials.token);
    expect(credentials.tokenHash).toBe(hashSessionToken(credentials.token));
    expect(credentials.tokenHash).not.toBe(credentials.token);
  });

  it("accepts only a well-formed session cookie", () => {
    const token = "a".repeat(64);

    expect(readSessionToken(`other=value; ${SESSION_COOKIE}=${token}`)).toBe(token);
    expect(readSessionToken(`${SESSION_COOKIE}=short`)).toBeUndefined();
    expect(readSessionToken("other=value")).toBeUndefined();
  });

  it("matches only the exact CSRF token", () => {
    const token = "b".repeat(64);

    expect(csrfMatches(token, token)).toBe(true);
    expect(csrfMatches(token, "c".repeat(64))).toBe(false);
    expect(csrfMatches(token, "short")).toBe(false);
  });
});

describe("reviewer role guard", () => {
  const app = express();
  app.get(
    "/reviewer-only",
    (req, res, next) => {
      const role = req.header("x-test-role");
      if (role) res.locals.auth = { user: { role } };
      next();
    },
    requireRole("REVIEWER"),
    (_req, res) => res.sendStatus(204),
  );

  it("allows the required role and rejects other or absent identities", async () => {
    expect((await request(app).get("/reviewer-only").set("x-test-role", "REVIEWER")).status).toBe(204);

    const requester = await request(app).get("/reviewer-only").set("x-test-role", "REQUESTER");
    expect(requester.status).toBe(403);
    expect(requester.body.error.code).toBe("FORBIDDEN");

    const anonymous = await request(app).get("/reviewer-only");
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe("SESSION_REQUIRED");
  });
});
