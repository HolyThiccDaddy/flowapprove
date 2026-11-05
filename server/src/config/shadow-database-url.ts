interface ParsedDatabaseUrl {
  hostname: string;
  port: string;
  databaseName: string;
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const shadowDatabaseName = /^flowapprove(?:_[a-z0-9]+)*_shadow$/i;

function parseDatabaseUrl(connectionString: string): ParsedDatabaseUrl {
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("Database URLs must be valid PostgreSQL connection URLs.");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("Database URLs must use the PostgreSQL protocol.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("Database URLs must identify a valid database.");
  }
  if (!databaseName) throw new Error("Database URLs must identify a valid database.");

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const port = parsed.port || "5432";
  return { hostname, port, databaseName };
}

function databaseIdentity(database: ParsedDatabaseUrl): string {
  const hostname = localHosts.has(database.hostname) ? "loopback" : database.hostname;
  return `${hostname}:${database.port}/${database.databaseName}`;
}

export function resolveShadowDatabaseUrl(databaseUrl: string, shadowDatabaseUrl?: string): string | undefined {
  const candidate = shadowDatabaseUrl?.trim();
  if (!candidate) return undefined;

  const applicationDatabase = parseDatabaseUrl(databaseUrl);
  const shadowDatabase = parseDatabaseUrl(candidate);
  if (!localHosts.has(shadowDatabase.hostname) || !shadowDatabaseName.test(shadowDatabase.databaseName)) {
    throw new Error("SHADOW_DATABASE_URL must use a dedicated local flowapprove_*_shadow database.");
  }
  if (databaseIdentity(applicationDatabase) === databaseIdentity(shadowDatabase)) {
    throw new Error("SHADOW_DATABASE_URL must identify a different PostgreSQL database from DATABASE_URL.");
  }
  return candidate;
}
