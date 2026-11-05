import "dotenv/config";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const prismaArguments = process.argv.slice(2);
if (prismaArguments.length === 0) {
  throw new Error("Pass a Prisma CLI command.");
}

if (prismaArguments[0] === "generate") {
  // Code generation parses the contract but never connects to this placeholder URL.
  process.env.DATABASE_URL ??= "postgresql://codegen@127.0.0.1:5432/flowapprove_codegen_test";
} else if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Prisma database commands.");
}

const prismaEntry = resolve(process.cwd(), "../node_modules/prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaEntry, ...prismaArguments], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
