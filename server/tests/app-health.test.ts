import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const uiOrigin = "http://127.0.0.1:5173";

describe("foundation health endpoint", () => {
  it("reports the API service without exposing configuration or database details", async () => {
    const response = await request(createApp({ uiOrigin })).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ service: "workflow-approval-api", status: "ok" });
  });

  it("allows browser credentials only from the configured UI origin", async () => {
    const app = createApp({ uiOrigin });
    const allowed = await request(app).get("/api/health").set("Origin", uiOrigin);
    const other = await request(app).get("/api/health").set("Origin", "https://untrusted.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe(uiOrigin);
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it.each([
    "*",
    "https://user:password@example.test",
    "https://example.test/path",
    "ftp://example.test",
  ])("refuses an unsafe UI origin configuration", (uiOriginValue) => {
    expect(() => createApp({ uiOrigin: uiOriginValue })).toThrow(/UI_ORIGIN/);
  });
});
