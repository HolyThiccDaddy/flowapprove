import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("foundation application shell", () => {
  it("shows the product name and the live API health result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ service: "workflow-approval-api", status: "ok" }),
      }),
    );

    render(<App />);

    expect(screen.getByRole("heading", { name: "Workflow and Approval System" })).toBeVisible();
    expect(await screen.findByRole("status")).toHaveTextContent("API online");
  });
});
