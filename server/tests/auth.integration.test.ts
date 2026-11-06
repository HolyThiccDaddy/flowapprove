import argon2 from "argon2";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createDatabaseClient } from "../src/db/client.js";
import { SESSION_COOKIE } from "../src/auth/session.js";

const prisma = createDatabaseClient();
const origin = "http://127.0.0.1:5173";
const password = "synthetic-f01-test-password";
const suffix = randomUUID();
const requesterEmail = `f01.requester.${suffix}@example.test`;
const reviewerEmail = `f01.reviewer.${suffix}@example.test`;
const inactiveEmail = `f01.inactive.${suffix}@example.test`;
let requesterId = "";
let reviewerId = "";
let inactiveId = "";
let app: ReturnType<typeof createApp>;

async function addUser(email: string, role: "REQUESTER" | "REVIEWER", isActive = true) {
  return prisma.user.create({
    data: {
      displayName: `F01 ${role}`,
      email,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      role,
      isActive,
    },
  });
}

function sessionCookie(response: request.Response): { header: string; token: string } {
  const header = response.headers["set-cookie"]?.[0]?.split(";")[0];
  if (!header) throw new Error("Expected the API to set a session cookie.");
  const token = header.slice(`${SESSION_COOKIE}=`.length);
  return { header: `${SESSION_COOKIE}=${token}`, token };
}

beforeAll(async () => {
  const [requester, reviewer, inactive] = await Promise.all([
    addUser(requesterEmail, "REQUESTER"),
    addUser(reviewerEmail, "REVIEWER"),
    addUser(inactiveEmail, "REQUESTER", false),
  ]);
  requesterId = requester.id;
  reviewerId = reviewer.id;
  inactiveId = inactive.id;
  app = createApp({ prisma, uiOrigin: origin });
});

afterAll(async () => {
  const userIds = [requesterId, reviewerId, inactiveId].filter(Boolean);
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe("F-01 authentication and server identity", () => {
  it.each([
    ["requester", "REQUESTER", () => requesterEmail],
    ["reviewer", "REVIEWER", () => reviewerEmail],
  ] as const)("logs in a %s and returns only its safe identity", async (_label, role, emailForUser) => {
    const email = emailForUser();
    const login = await request(app).post("/api/session").set("Origin", origin).send({ email: ` ${email.toUpperCase()} `, password });

    expect(login.status).toBe(200);
    expect(login.body.user).toEqual({
      id: role === "REQUESTER" ? requesterId : reviewerId,
      displayName: `F01 ${role}`,
      email,
      role,
    });
    expect(login.body).not.toHaveProperty("user.passwordHash");
    expect(login.body).not.toHaveProperty("tokenHash");
    expect(login.body).not.toHaveProperty("token");

    const { header, token } = sessionCookie(login);
    expect(header).toContain(SESSION_COOKIE);
    expect(login.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(login.headers["set-cookie"]?.[0]).toContain("SameSite=Lax");
    expect(login.headers["set-cookie"]?.[0]).toContain("Path=/");

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const savedSession = await prisma.session.findUniqueOrThrow({ where: { tokenHash } });
    expect(savedSession.userId).toBe(login.body.user.id);
    expect(savedSession.csrfToken).toBe(login.body.csrfToken);
    expect(savedSession.expiresAt.getTime() - savedSession.createdAt.getTime()).toBe(8 * 60 * 60 * 1000);

    const current = await request(app).get("/api/session").set("Cookie", header);
    expect(current.status).toBe(200);
    expect(current.body).toEqual({ user: login.body.user, csrfToken: login.body.csrfToken });
  });

  it("uses one generic denial and creates no session for wrong, unknown, or inactive accounts", async () => {
    const before = await prisma.session.count({ where: { userId: { in: [requesterId, inactiveId] } } });
    const attempts = await Promise.all([
      request(app).post("/api/session").set("Origin", origin).send({ email: requesterEmail, password: "incorrect-synthetic-password" }),
      request(app).post("/api/session").set("Origin", origin).send({ email: `missing.${suffix}@example.test`, password }),
      request(app).post("/api/session").set("Origin", origin).send({ email: inactiveEmail, password }),
    ]);

    expect(attempts.map((result) => result.status)).toEqual([401, 401, 401]);
    expect(attempts[0]?.body).toEqual({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } });
    expect(attempts[1]?.body).toEqual(attempts[0]?.body);
    expect(attempts[2]?.body).toEqual(attempts[0]?.body);
    expect(attempts.every((result) => !result.headers["set-cookie"])).toBe(true);
    expect(await prisma.session.count({ where: { userId: { in: [requesterId, inactiveId] } } })).toBe(before);
  });

  it("rejects malformed credentials and browser requests with an unapproved Origin", async () => {
    const malformed = await request(app).post("/api/session").set("Origin", origin).send({ email: requesterEmail, password: "short" });
    expect(malformed.status).toBe(422);
    expect(malformed.body.error.code).toBe("VALIDATION_FAILED");

    const clientSelectedRole = await request(app).post("/api/session").set("Origin", origin).send({ email: requesterEmail, password, role: "REVIEWER" });
    expect(clientSelectedRole.status).toBe(422);
    expect(clientSelectedRole.body.error.code).toBe("VALIDATION_FAILED");

    const invalidJson = await request(app).post("/api/session").set("Origin", origin).set("Content-Type", "application/json").send("{");
    expect(invalidJson.status).toBe(400);
    expect(invalidJson.body.error.code).toBe("INVALID_REQUEST");

    const wrongOrigin = await request(app).post("/api/session").set("Origin", "https://example.invalid").send({ email: requesterEmail, password });
    expect(wrongOrigin.status).toBe(403);
    expect(wrongOrigin.body.error.code).toBe("CSRF_INVALID");
  });

  it("denies anonymous and expired current-user requests without private identity", async () => {
    const anonymous = await request(app).get("/api/session");
    expect(anonymous.status).toBe(401);
    expect(anonymous.body).toEqual({ error: { code: "SESSION_REQUIRED", message: "Sign in to continue." } });

    const token = randomBytes(32).toString("hex");
    await prisma.session.create({
      data: {
        tokenHash: createHash("sha256").update(token).digest("hex"),
        csrfToken: randomBytes(32).toString("hex"),
        userId: requesterId,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });
    const expired = await request(app).get("/api/session").set("Cookie", `${SESSION_COOKIE}=${token}`);
    expect(expired.status).toBe(401);
    expect(expired.body).not.toHaveProperty("user");
  });

  it("requires Origin and CSRF for logout, revokes only the current session, and remains idempotent", async () => {
    const login = await request(app).post("/api/session").set("Origin", origin).send({ email: requesterEmail, password });
    const { header, token } = sessionCookie(login);
    const savedSession = await prisma.session.findUniqueOrThrow({
      where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    });

    const wrongOrigin = await request(app).delete("/api/session").set("Origin", "https://example.invalid").set("Cookie", header).set("X-CSRF-Token", login.body.csrfToken);
    expect(wrongOrigin.status).toBe(403);
    const wrongCsrf = await request(app).delete("/api/session").set("Origin", origin).set("Cookie", header).set("X-CSRF-Token", "f".repeat(64));
    expect(wrongCsrf.status).toBe(403);
    expect((await prisma.session.findUniqueOrThrow({ where: { id: savedSession.id } })).revokedAt).toBeNull();

    const logout = await request(app).delete("/api/session").set("Origin", origin).set("Cookie", header).set("X-CSRF-Token", login.body.csrfToken);
    expect(logout.status).toBe(204);
    expect(logout.headers["set-cookie"]?.[0]).toContain("Expires=Thu, 01 Jan 1970");
    expect((await prisma.session.findUniqueOrThrow({ where: { id: savedSession.id } })).revokedAt).not.toBeNull();
    expect((await request(app).get("/api/session").set("Cookie", header)).status).toBe(401);
    expect((await request(app).delete("/api/session").set("Cookie", header)).status).toBe(204);
  });
});
