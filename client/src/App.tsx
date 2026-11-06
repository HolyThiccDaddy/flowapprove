import { useEffect, useState, type FormEvent } from "react";

type User = { id: string; displayName: string; email: string; role: "REQUESTER" | "REVIEWER" };
type Session = { user: User; csrfToken: string };
type ApiError = { error?: { message?: string; fields?: Record<string, string> } };

function navigate(path: string): void {
  if (window.location.pathname !== path) window.history.replaceState(null, "", path);
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/session", { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          setSession(null);
          navigate("/login");
          return;
        }
        if (!response.ok) throw new Error("Authentication service is unavailable.");
        const current = (await response.json()) as Session;
        setSession(current);
        if (window.location.pathname === "/login" || window.location.pathname === "/") navigate("/requests");
      })
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        setMessage(result.error?.message ?? "Unable to sign in. Try again.");
        setFieldErrors(result.error?.fields ?? {});
        return;
      }
      setSession((await response.json()) as Session);
      setPassword("");
      navigate("/requests");
    } catch {
      setMessage("Unable to reach the sign-in service. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut(): Promise<void> {
    if (!session) return;
    setLogoutPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/session", {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRF-Token": session.csrfToken },
      });
      if (response.status !== 204) {
        const result = (await response.json()) as ApiError;
        setMessage(result.error?.message ?? "Unable to sign out. Try again.");
        return;
      }
      setSession(null);
      navigate("/login");
    } catch {
      setMessage("Unable to reach the sign-out service. Try again.");
    } finally {
      setLogoutPending(false);
    }
  }

  if (loading) {
    return <main className="page-shell"><section className="foundation-card" role="status">Checking your session…</section></main>;
  }

  if (unavailable) {
    return (
      <main className="page-shell">
        <section className="foundation-card" aria-labelledby="page-title">
          <span className="brand-mark" aria-hidden="true">FA</span>
          <p className="eyebrow">CPE 334 · Theme 5</p>
          <h1 id="page-title">Workflow and Approval System</h1>
          <p className="intro">The sign-in service is unavailable right now.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Try again</button>
        </section>
      </main>
    );
  }

  if (session) {
    return (
      <main className="page-shell">
        <section className="foundation-card" aria-labelledby="page-title">
          <span className="brand-mark" aria-hidden="true">FA</span>
          <p className="eyebrow">CPE 334 · Theme 5</p>
          <h1 id="page-title">Workflow and Approval System</h1>
          <p className="intro">You are signed in as {session.user.role === "REQUESTER" ? "Requester" : "Reviewer"}.</p>
          <div className="identity-card">
            <strong>{session.user.displayName}</strong>
            <span>{session.user.email}</span>
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="secondary-button" disabled={logoutPending} onClick={() => void signOut()}>
            {logoutPending ? "Signing out…" : "Sign out"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="foundation-card" aria-labelledby="page-title">
        <span className="brand-mark" aria-hidden="true">FA</span>
        <p className="eyebrow">CPE 334 · Theme 5</p>
        <h1 id="page-title">Workflow and Approval System</h1>
        <p className="intro">Sign in to submit requests or review assigned decisions.</p>
        <form className="login-form" onSubmit={(event) => void signIn(event)}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            required
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.email && <span className="field-error" id="email-error">{fieldErrors.email}</span>}
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password && <span className="field-error" id="password-error">{fieldErrors.password}</span>}
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
