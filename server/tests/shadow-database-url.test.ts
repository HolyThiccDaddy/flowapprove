import { describe, expect, it } from "vitest";
import { resolveShadowDatabaseUrl } from "../src/config/shadow-database-url.js";

describe("resolveShadowDatabaseUrl", () => {
  it("accepts a separate local shadow database", () => {
    expect(resolveShadowDatabaseUrl(
      "postgresql://app@127.0.0.1:5432/flowapprove_dev",
      "postgresql://app@127.0.0.1:5432/flowapprove_shadow",
    )).toBe("postgresql://app@127.0.0.1:5432/flowapprove_shadow");
  });

  it.each([
    "postgresql://different-user@127.0.0.1:5432/flowapprove_shadow",
    "postgresql://app@localhost:5432/flowapprove_shadow",
  ])("rejects the same database even when connection text differs: %s", (shadowUrl) => {
    expect(() => resolveShadowDatabaseUrl(
      "postgresql://app@127.0.0.1:5432/flowapprove_shadow",
      shadowUrl,
    )).toThrow(/different PostgreSQL database/);
  });

  it.each([
    "postgresql://app@db.example.com:5432/flowapprove_shadow",
    "postgresql://app@127.0.0.1:5432/flowapprove_other",
  ])("rejects shadow databases that are not dedicated local *_shadow databases: %s", (shadowUrl) => {
    expect(() => resolveShadowDatabaseUrl("postgresql://app@127.0.0.1:5432/flowapprove_dev", shadowUrl)).toThrow(/local.*_shadow/);
  });

  it("allows omission when no shadow URL is supplied", () => {
    expect(resolveShadowDatabaseUrl("postgresql://app@127.0.0.1:5432/flowapprove_dev", undefined)).toBeUndefined();
  });

  it("does not disclose credentials in configuration errors", () => {
    let message = "";
    try {
      resolveShadowDatabaseUrl(
        "postgresql://app:do-not-print-this@127.0.0.1:5432/flowapprove_dev",
        "postgresql://app:do-not-print-this@127.0.0.1:5432/flowapprove_dev",
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).not.toContain("do-not-print-this");
  });
});
