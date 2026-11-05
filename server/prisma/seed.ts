import "dotenv/config";
import argon2 from "argon2";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabaseClient } from "../src/db/client.js";
import { resolveSeedDatabaseUrl } from "../src/config/seed-database-url.js";
import type { PrismaClient } from "../src/generated/prisma/client.js";

type SeedRole = "REQUESTER" | "REVIEWER";
type SeedIdentity = {
  key: "requesterA" | "requesterB" | "reviewerR" | "reviewerS";
  email: string;
  displayName: string;
  role: SeedRole;
  passwordVariable: string;
};

const identities: SeedIdentity[] = [
  { key: "requesterA", email: "requester.a@example.test", displayName: "Requester A", role: "REQUESTER", passwordVariable: "SEED_REQUESTER_A_PASSWORD" },
  { key: "requesterB", email: "requester.b@example.test", displayName: "Requester B", role: "REQUESTER", passwordVariable: "SEED_REQUESTER_B_PASSWORD" },
  { key: "reviewerR", email: "reviewer.r@example.test", displayName: "Reviewer R", role: "REVIEWER", passwordVariable: "SEED_REVIEWER_R_PASSWORD" },
  { key: "reviewerS", email: "reviewer.s@example.test", displayName: "Reviewer S", role: "REVIEWER", passwordVariable: "SEED_REVIEWER_S_PASSWORD" },
];

export async function seedSyntheticIdentities(
  client: PrismaClient,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const users = new Map<SeedIdentity["key"], { id: string; defaultReviewerId: string | null }>();

  for (const identity of identities) {
    const existing = await client.user.findUnique({ where: { email: identity.email } });
    if (existing) {
      if (existing.role !== identity.role) {
        throw new Error(`Synthetic identity ${identity.email} exists with a conflicting role; seed preserved it.`);
      }
      users.set(identity.key, { id: existing.id, defaultReviewerId: existing.defaultReviewerId });
      continue;
    }

    const password = environment[identity.passwordVariable];
    if (!password || password.length < 12 || password.length > 128) {
      throw new Error(`${identity.passwordVariable} must be set to a local password of 12–128 characters to create a missing synthetic identity.`);
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const created = await client.user.create({
      data: {
        email: identity.email,
        displayName: identity.displayName,
        passwordHash,
        role: identity.role,
      },
    });
    users.set(identity.key, { id: created.id, defaultReviewerId: created.defaultReviewerId });
  }

  const assignments = [
    [users.get("requesterA"), users.get("reviewerR")],
    [users.get("requesterB"), users.get("reviewerS")],
  ] as const;

  for (const [requester, reviewer] of assignments) {
    if (!requester || !reviewer) throw new Error("Seed identity mapping is incomplete.");
    if (requester.defaultReviewerId !== null && requester.defaultReviewerId !== reviewer.id) continue;
    await client.user.updateMany({
      where: { id: requester.id, defaultReviewerId: null },
      data: { defaultReviewerId: reviewer.id },
    });
  }
}

async function main(): Promise<void> {
  process.env.DATABASE_URL = resolveSeedDatabaseUrl(process.env);
  const client = createDatabaseClient();
  try {
    await seedSyntheticIdentities(client);
    process.stdout.write("Seeded or verified four synthetic identities and two default reviewer mappings.\n");
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
