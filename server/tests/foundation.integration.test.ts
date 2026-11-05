import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createDatabaseClient } from "../src/db/client.js";
import { seedSyntheticIdentities } from "../prisma/seed.js";

const prisma = createDatabaseClient();
const testSeedEnvironment: NodeJS.ProcessEnv = {
  SEED_REQUESTER_A_PASSWORD: "integration-only-requester-a-password",
  SEED_REQUESTER_B_PASSWORD: "integration-only-requester-b-password",
  SEED_REVIEWER_R_PASSWORD: "integration-only-reviewer-r-password",
  SEED_REVIEWER_S_PASSWORD: "integration-only-reviewer-s-password",
};

beforeAll(async () => {
  await seedSyntheticIdentities(prisma, testSeedEnvironment);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("database foundation integration", () => {
  it("serves health only after a real PostgreSQL query succeeds", async () => {
    const app = createApp({ checkDatabase: async () => { await prisma.$queryRaw`SELECT 1`; } });
    const response = await request(app).get("/api/health/database");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ service: "workflow-approval-api", status: "ok", database: "ok" });
  });

  it("preserves seed credentials, reviewer mappings, and request history on repeat runs", async () => {
    const requester = await prisma.user.findUniqueOrThrow({ where: { email: "requester.a@example.test" } });
    const reviewer = await prisma.user.findUniqueOrThrow({ where: { email: "reviewer.r@example.test" } });
    const originalHash = requester.passwordHash;
    const requestRecord = await prisma.request.create({
      data: {
        requesterId: requester.id,
        assignedReviewerId: reviewer.id,
        title: "Seed preservation integration fixture",
        purpose: "Verify history and account state survive a repeated local seed.",
        estimatedAmount: "1250.00",
      },
    });

    try {
      await prisma.user.update({ where: { id: requester.id }, data: { passwordHash: "changed-only-inside-isolated-test-db" } });
      await prisma.requestEvent.create({
        data: {
          requestId: requestRecord.id,
          actorId: requester.id,
          eventType: "SUBMITTED",
          toStatus: "PENDING_REVIEW",
        },
      });

      await seedSyntheticIdentities(prisma, {
        ...testSeedEnvironment,
        SEED_REQUESTER_A_PASSWORD: "different-repeat-requester-a-password",
      });

      const [afterSeed, events, assignment] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: requester.id } }),
        prisma.requestEvent.count({ where: { requestId: requestRecord.id } }),
        prisma.user.findUniqueOrThrow({ where: { id: requester.id }, select: { defaultReviewerId: true } }),
      ]);

      expect(afterSeed.passwordHash).toBe("changed-only-inside-isolated-test-db");
      expect(assignment.defaultReviewerId).toBe(reviewer.id);
      expect(events).toBe(1);
    } finally {
      await prisma.requestEvent.deleteMany({ where: { requestId: requestRecord.id } });
      await prisma.request.deleteMany({ where: { id: requestRecord.id } });
      await prisma.user.update({ where: { id: requester.id }, data: { passwordHash: originalHash } });
    }
  });

  it("enforces important request bounds in PostgreSQL as a second line of defense", async () => {
    const requester = await prisma.user.findUniqueOrThrow({ where: { email: "requester.a@example.test" } });
    const reviewer = await prisma.user.findUniqueOrThrow({ where: { email: "reviewer.r@example.test" } });

    await expect(prisma.request.create({
      data: {
        requesterId: requester.id,
        assignedReviewerId: reviewer.id,
        title: "Invalid amount fixture",
        purpose: "PostgreSQL rejects a value below the allowed minimum.",
        estimatedAmount: "0.00",
      },
    })).rejects.toThrow();

    await expect(prisma.request.create({
      data: {
        requesterId: requester.id,
        assignedReviewerId: reviewer.id,
        title: "Invalid currency fixture",
        purpose: "PostgreSQL rejects currency outside the selected THB baseline.",
        estimatedAmount: "1.00",
        currency: "USD",
      },
    })).rejects.toThrow();
  });
});
