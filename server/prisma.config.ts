import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { resolveShadowDatabaseUrl } from "./src/config/shadow-database-url.js";

const databaseUrl = env("DATABASE_URL");
const shadowDatabaseUrl = resolveShadowDatabaseUrl(databaseUrl, process.env.SHADOW_DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npm run db:seed",
  },
  datasource: {
    url: databaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
