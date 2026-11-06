import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const requesterSession = {
  user: { id: "requester-id", displayName: "Test Requester", email: "requester@example.test", role: "REQUESTER" },
  csrfToken: "a".repeat(64),
};

function response(status: number, body?: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("authentication UI", () => {
  it("signs in and shows the server-provided identity", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(401, { error: { code: "SESSION_REQUIRED" } }))
      .mockResolvedValueOnce(response(200, requesterSession));
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    fireEvent.change(await screen.findByLabelText("Email address"), { target: { value: "requester@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "synthetic-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Test Requester")).toBeVisible();
    expect(screen.getByText("You are signed in as Requester.")).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/session", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email: "requester@example.test", password: "synthetic-password-123" }),
    }));
  });

  it("shows the same generic sign-in error without exposing an account", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(response(401, { error: { code: "SESSION_REQUIRED" } }))
      .mockResolvedValueOnce(response(401, { error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } })));
    render(<App />);

    fireEvent.change(await screen.findByLabelText("Email address"), { target: { value: "unknown@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "synthetic-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(screen.queryByText("Test Requester")).not.toBeInTheDocument();
  });

  it("loads the current session and sends its CSRF token on logout", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(200, requesterSession))
      .mockResolvedValueOnce(response(204));
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    expect(await screen.findByText("Test Requester")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/session", expect.objectContaining({
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRF-Token": requesterSession.csrfToken },
    })));
    expect(await screen.findByLabelText("Email address")).toBeVisible();
    expect(screen.queryByText("Test Requester")).not.toBeInTheDocument();
  });
});
