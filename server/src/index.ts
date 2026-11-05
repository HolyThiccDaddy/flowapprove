import "dotenv/config";
import { createApp } from "./app.js";
import { createDatabaseClient } from "./db/client.js";

const prisma = createDatabaseClient();

const port = Number(process.env.PORT ?? 4000);
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be a valid TCP port number.");
}

const app = createApp({
  checkDatabase: async () => {
    await prisma.$queryRaw`SELECT 1`;
  },
});

const server = app.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Workflow Approval API listening on 127.0.0.1:${port}\n`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
