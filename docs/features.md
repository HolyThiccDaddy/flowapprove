# Feature inventory (draft)

This inventory derives the baseline from Theme 5 and Deliverable 1. Proposed context is purchase requests. Status is **planned**, not implemented.

| ID | Feature | Scope | Requirements | Depends on | Sprint |
| --- | --- | --- | --- | --- | --- |
| F-01 | Identity and session | Seeded login, current user, logout, role from server session. | FR-01, NFR-01, NFR-05 | Seeded User data | 1 |
| F-02 | Submit and retrieve request | Requester submits and reloads own request detail/status; assigned reviewer shown through server policy. | FR-02, FR-04, BR-03, BR-06, NFR-02, NFR-03 | F-01; D-01/D-04 | 1 |
| F-03 | Assigned review and history | Assigned Reviewer approves/rejects; enforce assignment, no self-approval, invalid transition rejection and persisted decision/history. | FR-03, FR-04, BR-01–04, NFR-01–03 | F-01, F-02; D-03 | 1 |
| F-04 | Return and resubmit | Reviewer returns with reason; owner edits and resubmits while preserving revision/event history. | FR-05, BR-05, NFR-02 | F-03; D-02/D-03 | 2 |
| F-05 | Queue and filters | Assigned Reviewer queue and role-scoped filtering by agreed fields. | FR-06, BR-03, NFR-03 | F-02–04 | 2 |
| F-06 | Decision summaries | Aggregated decisions within allowed reviewer scope. | FR-07, BR-03, NFR-03 | F-03–05 | 3 |
| F-07 | Additional approval stage (conditional) | More than one reviewer stage, only if D-05 is approved and fully specified. | FR-08, BR-01–04 | D-05, F-03/F-04 | 3 |
| SYS-01 | UI quality and accessibility | Loading, empty, validation, error/retry, submitting/success and responsive states across screens. | NFR-03 | F-01–06 | 1–3 |
| SYS-02 | Performance check (proposed) | Measure agreed p95 target on seeded fixture. | NFR-04 | F-05/F-06, D-06 | 3 |

Feature contracts must be approved and versioned before implementing each feature. A feature's presence in this table does not mean it is complete.
