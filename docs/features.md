# Feature inventory (draft)

Issue #1 review candidate, 5 Nov 2026. Equipment purchase requests are selected for teammate review; pair approval is pending. Status is **planned**, not implemented. SRS is canonical for requirement/decision IDs.

| ID | Feature | Scope | Requirements | Depends on | Sprint |
| --- | --- | --- | --- | --- | --- |
| F-01 | Identity and session | Seeded login, current user, logout, role from server session. | FR-01, NFR-01, NFR-05 | D-06; seeded User data | 1 |
| F-02 | Submit and retrieve request | Submit, owned/assigned lists and detail, controlled assignment and submitted-field lock. | FR-02, FR-04, BR-03–06, NFR-01–03 | F-01; D-01/D-02/D-04 | 1 |
| F-03 | Assigned review and history | Assigned Reviewer approves/rejects; enforce assignment, no self-approval, invalid transition rejection and persisted decision/history. | FR-03, FR-04, BR-01–04, NFR-01–03 | F-01, F-02; D-03 | 1 |
| F-04 | Return and resubmit | Return/revise/resubmit with preserved prior submissions and event history. | FR-05, BR-01–05, NFR-01–03 | F-03; D-02/D-03 | 2 |
| F-05 | Filters | Role-scoped status/date filters; minimal assigned queue is already in F-02. | FR-06, BR-03, NFR-01/03 | F-02–04 | 2 |
| F-06 | Decision summaries | Aggregated decisions within allowed reviewer scope. | FR-07, BR-03, NFR-01/03 | F-03–05 | 3 |
| F-07 | Additional approval stage (deferred) | Outside the one-stage baseline; adoption requires explicit scope change. | FR-08 (deferred) | D-05 revision and full contract | Not committed |
| SYS-01 | UI quality and accessibility | Loading, empty, validation, error/retry, submitting/success and responsive states across screens. | NFR-03 | F-01–06 | 1–3; UI-CHECK-01 plus selected E2E |
| SYS-02 | Performance check (proposed) | Measure agreed p95 target on seeded fixture. | NFR-04 | F-05/F-06, D-06 | 3 |

Feature contracts must be approved and versioned before implementing each feature. A feature's presence in this table does not mean it is complete.

S1 work is tracked by Issues #1–6; selected branch/PR/dependency sequence is in project-plan.md. BR-04 atomic history applies to submission in F-02 and decisions in F-03. NFR-05 also has SEC-CHECK-01 release verification; see contracts/traceability. Future performance target remains a proposal, not a measured result.
