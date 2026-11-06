import cors from "cors";
import express, { type ErrorRequestHandler, type Express } from "express";
import type { PrismaClient } from "./generated/prisma/client.js";
import { registerSessionRoutes } from "./auth/routes.js";

export interface AppDependencies {
  checkDatabase?: () => Promise<void>;
  prisma?: PrismaClient;
  uiOrigin?: string;
}

function resolveUiOrigin(configuredOrigin: string | undefined): string {
  const candidate = configuredOrigin ?? "http://127.0.0.1:5173";
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("UI_ORIGIN must be an absolute HTTP or HTTPS origin.");
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("UI_ORIGIN must be an absolute HTTP or HTTPS origin without credentials, path, query, or fragment.");
  }
  return parsed.origin;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const uiOrigin = resolveUiOrigin(dependencies.uiOrigin ?? process.env.UI_ORIGIN);
  app.disable("x-powered-by");
  app.use(cors({
    origin: (origin, callback) => callback(null, origin === uiOrigin ? origin : false),
    credentials: true,
  }));
  app.use(express.json({ limit: "32kb" }));

  if (dependencies.prisma) {
    registerSessionRoutes(app, dependencies.prisma, uiOrigin);
  } else {
    app.all("/api/session", (_request, response) => {
      response.status(503).json({ error: { code: "SERVICE_UNAVAILABLE", message: "Authentication is unavailable." } });
    });
  }

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ service: "workflow-approval-api", status: "ok" });
  });

  app.get("/api/health/database", async (_request, response) => {
    if (!dependencies.checkDatabase) {
      response.status(503).json({ service: "workflow-approval-api", status: "unavailable" });
      return;
    }

    try {
      await dependencies.checkDatabase();
      response.status(200).json({ service: "workflow-approval-api", status: "ok", database: "ok" });
    } catch {
      response.status(503).json({ service: "workflow-approval-api", status: "unavailable" });
    }
  });

  const handleErrors: ErrorRequestHandler = (error: unknown, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    const type = typeof error === "object" && error !== null && "type" in error
      ? (error as { type?: unknown }).type
      : undefined;
    if (type === "entity.parse.failed") {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "Request body is not valid JSON." } });
      return;
    }
    if (type === "entity.too.large") {
      response.status(413).json({ error: { code: "REQUEST_TOO_LARGE", message: "Request body exceeds the 32 KiB limit." } });
      return;
    }
    response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } });
  };
  app.use(handleErrors);

  return app;
}
