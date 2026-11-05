import { describe, expect, it } from "vitest";
import { resolveTestDatabaseUrl } from "../src/config/test-database-url.js";

describe("resolveTestDatabaseUrl", () => {
  it("requires an explicit test database URL and never falls back to DATABASE_URL", () => {
    expect(() =>
      resolveTestDatabaseUrl({
        TEST_DATABASE_URL: undefined,
        DATABASE_URL: "postgresql://localhost/flowapprove_dev",
      }),
    ).toThrow(/TEST_DATABASE_URL is required/);
  });

  it("accepts PostgreSQL test database names ending in _test", () => {
    expect(
      resolveTestDatabaseUrl({
        TEST_DATABASE_URL: "postgresql://localhost:5432/flowapprove_test?schema=public",
      }),
    ).toBe("postgresql://localhost:5432/flowapprove_test?schema=public");
  });

  it.each([
    ["development database", "postgresql://localhost:5432/flowapprove_dev"],
    ["SQLite URL", "file:./test.db"],
    ["malformed URL", "not-a-url"],
  ])("rejects %s before a test runner can touch the database", (_label, url) => {
    expect(() => resolveTestDatabaseUrl({ TEST_DATABASE_URL: url })).toThrow();
  });

  it("rejects a remote URL even when the database name ends in _test", () => {
    expect(() => resolveTestDatabaseUrl({ TEST_DATABASE_URL: "postgresql://db.example.com:5432/flowapprove_test" })).toThrow(/local PostgreSQL/);
  });

  it("does not disclose credentials when rejecting a URL", () => {
    const secretUrl = "postgresql://test-user:never-print-this@localhost/flowapprove_dev";

    let message = "";
    try {
      resolveTestDatabaseUrl({ TEST_DATABASE_URL: secretUrl });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).not.toContain("never-print-this");
  });
});
