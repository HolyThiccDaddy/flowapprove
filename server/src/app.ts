import cors from "cors";
import express, { type Express } from "express";

export interface AppDependencies {
  checkDatabase?: () => Promise<void>;
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

  return app;
}
