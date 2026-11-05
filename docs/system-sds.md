# System-Level Software Design Specification (draft)

**Status:** Proposed architecture for pair review. No stack or schema is approved or implemented yet.

## 1. Architecture and boundaries

Proposed modular monolith:

`Browser UI → JSON API/application layer → PostgreSQL`

- **UI:** React + TypeScript. Renders role-scoped views, validation and request state. It never decides the user's identity or permission.
- **API/application:** Node.js + TypeScript. Derives identity from the server session, validates requests, enforces role/owner/assignment/state rules and performs transactions.
- **Database:** PostgreSQL with migration-managed schema and synthetic seed users/data. Constraints backstop uniqueness and referential integrity.
- **Deployment:** document environment and Docker suitability now. Actual Docker, CI/CD and GCP setup are Lab 5; not a Deliverable 1 prerequisite.

Stack is a proposal; D-06 must be resolved by the pair before freezing contracts.

## 2. Data model proposal

| Entity | Main fields and links | Constraints / purpose |
| --- | --- | --- |
| User | id, displayName, email, passwordHash, role, active | email unique; role is server controlled. Sprint 1 uses seeded Requester or Reviewer accounts. |
| Request | id, requesterId → User, assignedReviewerId → User, title, purpose, estimatedAmount DECIMAL, currency, status, submittedAt, createdAt, updatedAt, version | Owner and assigned Reviewer are explicit; amount is decimal; indexes proposed for requester/status and reviewer/status. |
| Decision | id, requestId → Request, reviewerId → User, action, reason, decidedAt | Stores approve/reject/return event; reviewer authorization checked in transaction. |
| RequestEvent | id, requestId → Request, actorId → User, eventType, fromStatus, toStatus, occurredAt, metadata | Append-only history for submission, decision and later resubmission. |
| RequestRevision (later, optional) | id, requestId → Request, revisionNo, title, purpose, estimatedAmount, submittedAt | Preserves prior submitted values if D-02 selects version snapshots. |

Use database transactions so a decision, state update and history record either all commit or all roll back. Consider a version/conditional update to reject concurrent decisions. The exact uniqueness/locking strategy belongs in the contract after stack selection.

## 3. Sprint 1 state and permissions

Proposed statuses: `PENDING_REVIEW`, `APPROVED`, `REJECTED`. A draft state before submission is optional and must be agreed. Only PENDING_REVIEW accepts a terminal decision. Invalid/repeated/concurrent decisions produce a safe conflict response and no extra decision event.

| Operation | Requester | Reviewer |
| --- | --- | --- |
| Login/current identity/logout | Own account/session | Own account/session |
| Submit request | Yes; server sets requester ID | No |
| Read request/detail/history | Own only | Assigned only |
| Approve/reject | No | Assigned only; requester ID must differ from actor ID |
| Return (S2 proposal) | No | Assigned only |
| Edit/resubmit returned request (S2 proposal) | Own only | No |
| Decision summary (S3 proposal) | No | Authorized scope only |

Backend checks are authoritative. UI controls only reflect allowed actions. Request bodies never set requesterId, acting user ID, role or trusted assignment.

## 4. Session and credential handling

Proposed server-managed session in secure, HTTP-only, same-site cookie; TLS in deployed environments; expiry and logout invalidation documented in the feature contract. Passwords use a standard adaptive password-hashing function; plaintext is never stored. Current-user endpoint returns only safe identity/role fields. Keep secrets in local environment or deployment secret storage, never source control or UI bundles.

## 5. API conventions (proposed)

Prefix: `/api`; JSON request/response; authenticated actor comes only from session.

| Method/path | Purpose | Expected responses |
| --- | --- | --- |
| POST /api/session | Login | 200; 401 invalid credentials; safe generic error |
| GET /api/session | Current identity | 200; 401 |
| DELETE /api/session | Logout | 204; safe idempotent policy to specify |
| POST /api/requests | Submit | 201; 401; 403; 422 invalid input or no eligible assignment |
| GET /api/requests | Role-scoped list | 200; 401 |
| GET /api/requests/:id | Own/assigned detail and history | 200; safe 403/404 |
| POST /api/requests/:id/decisions | Approve/reject | 200; 401; 403/404; 409 invalid/concurrent state; 422 invalid reason |

Error body proposal: stable `code`, safe human-readable `message`, optional field errors. Never return SQL, stack traces, storage paths, hashes or secrets. Finalize exact status/body shapes in feature contracts.

## 6. UI structure and shared states

- Login.
- Requester: own request list, create form, request detail/history.
- Reviewer: assigned queue, request detail, decision form.
- Current user/role comes from API identity, not a role selector.
- All views need loading, empty, validation, request failure/retry, submitting and success states.
- Disable duplicate submission while pending; show safe error when a state changed concurrently.
- Review responsive behavior at 375, 768 and 1280 CSS px, including focus and keyboard interaction.

## 7. Configuration and delivery design

Proposed environment names: DATABASE_URL, SESSION_SECRET, PORT, UI_API_BASE_URL. Add a placeholder-only example when implementation begins. Apply database migrations in a documented order; seed only synthetic accounts. Design for Docker and durable GCP database/service deployment. Cloud resources and deployment are out of scope until Lab 5.

## 8. Open design decisions

Resolve D-01 assignment behavior, D-02 edit/revision policy, D-03 reason policy, D-04 amount/currency bounds, D-05 stage count, D-06 stack and D-07 full names in `docs/srs.md` before affected contracts become implementation-ready.
