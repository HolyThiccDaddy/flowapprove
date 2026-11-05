import "dotenv/config";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { resolveTestDatabaseUrl } from "../src/config/test-database-url.js";

const testDatabaseUrl = resolveTestDatabaseUrl(process.env);
const childEnvironment = { ...process.env, DATABASE_URL: testDatabaseUrl };
const prismaEntry = resolve(process.cwd(), "../node_modules/prisma/build/index.js");
const vitestEntry = resolve(process.cwd(), "../node_modules/vitest/vitest.mjs");

function run(entry: string, args: string[]): void {
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd: process.cwd(),
    env: childEnvironment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(prismaEntry, ["migrate", "deploy"]);
run(vitestEntry, ["run", "--config", "vitest.config.ts"]);
