import { useEffect, useState } from "react";

type HealthResponse = {
  service: string;
  status: string;
};

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth(): Promise<void> {
      try {
        const response = await fetch("/api/health", { signal: controller.signal });
        const health = (await response.json()) as HealthResponse;
        if (!response.ok || health.service !== "workflow-approval-api" || health.status !== "ok") {
          throw new Error("The API returned an unhealthy response.");
        }
        setApiStatus("online");
      } catch {
        if (!controller.signal.aborted) setApiStatus("unavailable");
      }
    }

    void loadHealth();
    return () => controller.abort();
  }, []);

  return (
    <main className="page-shell">
      <section className="foundation-card" aria-labelledby="page-title">
        <span className="brand-mark" aria-hidden="true">FA</span>
        <p className="eyebrow">CPE 334 · Theme 5</p>
        <h1 id="page-title">Workflow and Approval System</h1>
        <p className="intro">A secure place to submit requests and review decisions.</p>
        <div className={`service-state service-state--${apiStatus}`} role="status" aria-live="polite">
          <span className="service-dot" aria-hidden="true" />
          {apiStatus === "checking" ? "Checking API…" : apiStatus === "online" ? "API online" : "API unavailable"}
        </div>
        <p className="foundation-note">Application foundation is ready. Request workflows are being built next.</p>
      </section>
    </main>
  );
}
