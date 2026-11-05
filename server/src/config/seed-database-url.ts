export interface SeedDatabaseEnvironment {
  DATABASE_URL?: string;
}

const allowedDatabaseName = /^flowapprove(?:_[a-z0-9]+)*_(?:dev|test)$/i;
const allowedHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function resolveSeedDatabaseUrl(environment: SeedDatabaseEnvironment): string {
  const candidate = environment.DATABASE_URL?.trim();
  if (!candidate) throw new Error("DATABASE_URL is required for seeding.");

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL for local seeding.");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if ((parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") || !allowedHosts.has(hostname)) {
    throw new Error("Seed is limited to a local PostgreSQL server; remote database URLs are refused.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("DATABASE_URL must identify an approved local application database.");
  }

  if (!allowedDatabaseName.test(databaseName)) {
    throw new Error("Seed is limited to a local flowapprove_*_dev or flowapprove_*_test database.");
  }

  return candidate;
}
