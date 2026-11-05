import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serverPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { scripts: Record<string, string> };

describe("generated Prisma Client lifecycle", () => {
  it("generates the client before starting the API and running the seed", () => {
    expect(serverPackage.scripts.predev).toBe("npm run prisma:generate");
    expect(serverPackage.scripts["predb:seed"]).toBe("npm run prisma:generate");
  });

  it("routes Prisma's configured seed through the lifecycle hook", () => {
    const prismaConfig = readFileSync(new URL("../prisma.config.ts", import.meta.url), "utf8");
    expect(prismaConfig).toContain('seed: "npm run db:seed"');
  });

  it("generates the client before applying test migrations", () => {
    const runner = readFileSync(new URL("../scripts/run-tests.ts", import.meta.url), "utf8");
    const generateIndex = runner.indexOf('run(prismaEntry, ["generate"]);');
    const migrateIndex = runner.indexOf('run(prismaEntry, ["migrate", "deploy"]);');

    expect(generateIndex).toBeGreaterThanOrEqual(0);
    expect(migrateIndex).toBeGreaterThan(generateIndex);
  });
});
