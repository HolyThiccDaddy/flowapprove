import { expect, test } from "@playwright/test";

test("anonymous visitors see sign in while the live API reaches PostgreSQL", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Workflow and Approval System" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();

  const databaseHealth = await page.request.get("/api/health/database");
  expect(databaseHealth.status()).toBe(200);
  await expect(databaseHealth.json()).resolves.toEqual({
    service: "workflow-approval-api",
    status: "ok",
    database: "ok",
  });
});
