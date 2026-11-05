export interface DatabaseEnvironment {
  TEST_DATABASE_URL?: string;
  DATABASE_URL?: string;
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function resolveTestDatabaseUrl(environment: DatabaseEnvironment): string {
  const candidate = environment.TEST_DATABASE_URL?.trim();
  if (!candidate) {
    throw new Error("TEST_DATABASE_URL is required; refusing to fall back to DATABASE_URL.");
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("TEST_DATABASE_URL must use the PostgreSQL protocol.");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!localHosts.has(hostname)) {
    throw new Error("TEST_DATABASE_URL must use a local PostgreSQL server.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("TEST_DATABASE_URL must identify a local test database.");
  }

  if (!databaseName.toLowerCase().endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL database name must end with _test.");
  }

  return candidate;
}
