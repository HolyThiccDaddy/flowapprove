import { describe, expect, it } from "vitest";
import { resolveSeedDatabaseUrl } from "../src/config/seed-database-url.js";

describe("resolveSeedDatabaseUrl", () => {
  it.each([
    "postgresql://flowapprove_app@127.0.0.1:5432/flowapprove_dev",
    "postgresql://flowapprove_app@localhost:5432/flowapprove_issue2_test",
    "postgres://flowapprove_app@[::1]:5432/flowapprove_dev",
  ])("accepts an explicitly named local application database: %s", (databaseUrl) => {
    expect(resolveSeedDatabaseUrl({ DATABASE_URL: databaseUrl })).toBe(databaseUrl);
  });

  it.each([
    ["missing URL", undefined],
    ["remote server", "postgresql://flowapprove_app:secret@example.com/flowapprove_dev"],
    ["unapproved database name", "postgresql://flowapprove_app@127.0.0.1:5432/postgres"],
    ["non-PostgreSQL URL", "file:./flowapprove_dev.db"],
  ])("rejects %s", (_label, databaseUrl) => {
    expect(() => resolveSeedDatabaseUrl({ DATABASE_URL: databaseUrl })).toThrow();
  });

  it("never includes a password in a rejection message", () => {
    let message = "";
    try {
      resolveSeedDatabaseUrl({ DATABASE_URL: "postgresql://user:do-not-print-this@db.example.com/flowapprove_dev" });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).not.toContain("do-not-print-this");
  });
});
