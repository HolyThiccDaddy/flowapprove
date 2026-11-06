import { expect, test } from "@playwright/test";
import { env } from "node:process";

test("a seeded requester signs in, sees server identity, and signs out", async ({ page }) => {
  const password = env.SEED_REQUESTER_A_PASSWORD;
  test.skip(!password, "Set the synthetic SEED_REQUESTER_A_PASSWORD used by the local seed.");

  await page.goto("/login");
  await page.getByLabel("Email address").fill("requester.a@example.test");
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("You are signed in as Requester.")).toBeVisible();
  await expect(page.getByText("Requester A")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Email address")).toBeVisible();
});
