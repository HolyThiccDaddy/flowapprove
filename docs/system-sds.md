# System-Level SDS — Issue #1 review candidate

**Status:** Selected baseline proposal for teammate review, 5 Nov 2026. No implemented stack/schema or passing verification is claimed. Canonical decisions: [SRS](srs.md), D-01–06. Values below are reviewable design choices, not course-mandated limits.

## 1. Architecture and responsibilities

Browser React/TypeScript UI → Node.js/TypeScript JSON API → persistent PostgreSQL database. Use a modular monolith. Proposed tooling for Issue #2: Vite, Express, Prisma migrations, Argon2id, Vitest/Supertest and Playwright. Issue #2 checks compatible versions, locks dependencies and validates commands; no specific version is selected here.

UI renders server identity and role-scoped views; it cannot choose trusted actor/assignment/state. API validates inputs and enforces session, role, ownership, assignment, state and self-approval. PostgreSQL provides exact decimal storage, foreign keys and atomic request/decision/history writes.

## 2. Data model and migrations

| Entity | Proposed fields/types | Constraints and responsibilities |
| --- | --- | --- |
| User | id UUID, displayName VARCHAR(120), email VARCHAR(254), passwordHash TEXT, role REQUESTER/REVIEWER, active BOOLEAN, defaultReviewerId nullable UUID→User, createdAt TIMESTAMPTZ | Unique normalized lowercase email; server-controlled role and mapping. Mapping eligibility checked at submission. One role/account in S1. |
| Session | id UUID, tokenHash CHAR(64), csrfToken CHAR(64), userId UUID→User, createdAt/expiresAt/revokedAt TIMESTAMPTZ | Unique authentication-token hash; raw authentication token never stored. Separate random CSRF token is retained server-side for current-user retrieval; it alone cannot authenticate. Index user/expiry. |
| Request | id UUID, requesterId UUID→User, assignedReviewerId UUID→User, title VARCHAR(120), purpose VARCHAR(2000), estimatedAmount NUMERIC(12,2), currency CHAR(3), status enum, version INTEGER, submittedAt/createdAt/updatedAt TIMESTAMPTZ | Non-null owner/assignment; check owner != assigned reviewer, amount 0.01–1000000.00 and THB; version starts 0. Index requester/date/id and reviewer/status/date/id. |
| Decision | id UUID, requestId UUID→Request, reviewerId UUID→User, action APPROVE/REJECT, reason nullable VARCHAR(1000), decidedAt TIMESTAMPTZ | Unique requestId for S1's single terminal decision; reject requires trimmed reason. Actor equals authorized assigned Reviewer. |
| RequestEvent | id UUID, requestId UUID→Request, actorId UUID→User, eventType SUBMITTED/APPROVED/REJECTED, fromStatus nullable enum, toStatus enum, reason nullable VARCHAR(1000), occurredAt TIMESTAMPTZ | Append-only through application; submission plus exactly one terminal event in S1. Order occurredAt/id; index request/time/id. |

Use RESTRICT for domain references to avoid accidental history deletion. State names are PENDING_REVIEW, APPROVED, REJECTED. No draft/edit/delete endpoint or history-update endpoint exists in S1.

Migrations in server/prisma/migrations create the schema, constraints and indexes. Normal setup applies committed migrations; do not reset an existing database. Reproducible synthetic seed: at least two Requesters and two Reviewers, deterministic identities/mappings and locally supplied initial passwords; reruns create missing records without overwriting changed credentials/history. Test edge mappings are isolated fixtures, not normal demo accounts.

S2 requires a reviewed additive migration: preserve immutable submission snapshots/revisions, add RETURNED/resubmission cycles, and revise S1's unique terminal-decision constraint so history survives multiple cycles. Do not reuse S1 uniqueness without analyzing this change.

Design rationale: exact decimal avoids floating-point money drift; transactions/conditional updates prevent split decision/history; explicit owner/assignment enables backend authorization and indexable scoped queries.

## 3. Submission and decision transactions

Submission derives requester from the active session, reads the controlled mapping and verifies active Reviewer role and different ID. No eligible mapping yields 422 NO_ELIGIBLE_REVIEWER with no Request/Event writes. Otherwise create pending request plus one SUBMITTED event atomically.

Decision transaction rechecks identity/role/assignment/self-approval and conditionally changes status where id matches, status=PENDING_REVIEW and version=expectedVersion. Exactly one row must change; increment version once, insert Decision and matching event in the same transaction. Concurrent losers/repeats yield 409 INVALID_TRANSITION with no partial changes. Roll back on any write failure. Unique Decision.requestId backstops duplicate terminal outcomes.

The no-self guard must still be tested with a controlled in-memory/unit input where requester=reviewer, even though normal schema/seed blocks that state. Never weaken production constraints just to create a test fixture.

## 4. Role and record permissions

| Operation | Requester | Reviewer |
| --- | --- | --- |
| Login/current user/logout | Own session | Own session |
| Submit | Owner from session only | 403 FORBIDDEN |
| List/detail/history | Owned requests only | Assigned requests only |
| Approve/reject | 403 FORBIDDEN | Assigned, pending, not self |
| Edit/delete submitted fields | No endpoint | No endpoint |

All API reads/writes authenticate first. A wrong role for an operation yields 403. A missing or out-of-scope request yields the same 404 REQUEST_NOT_FOUND, without private fields. Lists scope in SQL before pagination; never fetch all records and filter only in UI.

## 5. Authentication and security proposal

Use a random 256-bit opaque session cookie (workflow_approval_session), HTTP-only, SameSite=Lax, path=/; Secure in deployed HTTPS, explicitly disabled only for local HTTP development. Store only its SHA-256 hash. Session absolute lifetime is 8 hours, no sliding renewal; enforce active user and expiry/revocation each request. Passwords use Argon2id; login errors do not reveal account existence. Password inputs: 12–128 characters, not trimmed; seed obtains initial values locally, never embeds real passwords.

GET /api/session returns safe user plus the session-bound CSRF token (not an authentication credential); UI keeps it only in memory and sends X-CSRF-Token on authenticated writes. Store this separate random token in the protected server session so it can be returned again after page reload; compare using a timing-safe method. Require an allowlisted Origin on browser mutations including login, and session-bound CSRF validation for authenticated mutations. API permits credentials only from the configured UI origin; never wildcard credentials. Redact cookies, passwords, connection strings and tokens from logs/evidence. Production uses TLS. Bound JSON body size to 32 KiB.

Logout revokes the presented session and expires the cookie. No active session: return 204 and clear stale cookie without exposing identity. With a valid session, require Origin/CSRF before revocation; other sessions are not implicitly revoked.

Authentication is tested in F-01. Rate-limit public login in the implementation with a standard maintained mechanism and document its verified settings before release; do not fabricate a tested configuration in this planning baseline.

## 6. Shared API conventions

Use JSON, UUID IDs, UTC ISO-8601 timestamps; display Asia/Bangkok. Money travels as decimal strings and serializes with two fractional digits. See contracts for exact bodies.

Success objects use {user,csrfToken}, {request}, {requests,nextCursor} as appropriate. Errors use {error:{code,message,fields?}} with safe messages and no stack/SQL/internal paths. Only field-validation errors include fields (field→message).

Order: authentication → role/record scope → CSRF/Origin for authenticated writes → input/state validation → transaction. Login is the unauthenticated Origin-checked exception.

| Status | Meaning/code |
| --- | --- |
| 400 | Malformed JSON or invalid UUID: INVALID_REQUEST |
| 401 | Invalid login: INVALID_CREDENTIALS; protected session missing/expired/revoked: SESSION_REQUIRED |
| 403 | Wrong role/self attempt: FORBIDDEN; invalid mutation Origin/CSRF: CSRF_INVALID |
| 404 | Missing/out-of-scope request: REQUEST_NOT_FOUND |
| 409 | Invalid, stale or repeated decision: INVALID_TRANSITION |
| 422 | Field errors: VALIDATION_FAILED; assignment unavailable: NO_ELIGIBLE_REVIEWER |
| 500 | Unexpected failure: INTERNAL_ERROR, safe message, transaction rolled back |

Unknown write-body fields, including actor/role/assignment/status injection, are rejected with 422; do not silently trust them. Query parameters outside the allowed list are rejected. Browser navigation is not an authorization boundary.

## 7. UI and shared behavior

Routes: /login, /requests (role-scoped list), /requests/new (Requester only), /requests/:id (authorized detail/history plus Reviewer decision form). Current user/navigation comes from session API. A protected deep link requires login; do not render stale private records after logout or role/session failure.

Use visible labels and field-level errors linked to controls, keyboard navigation, focus feedback, readable status text and announced submit results. Verify 375/768/1280 CSS px without horizontal overflow or overlapping actions. Views have loading, empty, failure/retry and success states. Preserve form input on validation/network failure; disable double-click while in flight. On 409, refresh the request and show that another decision has already occurred; never overwrite it. After uncertain submission, tell the user to inspect their list before retrying rather than silently auto-posting again. No idempotency guarantee for separately retried submissions is claimed in S1.

## 8. Configuration, test isolation and delivery

Document DATABASE_URL, TEST_DATABASE_URL, SESSION_SECRET if required by chosen session middleware, PORT, UI_ORIGIN and UI_API_BASE_URL in placeholder-only examples. Never expose server secrets in Vite/client variables. Guard the test harness so missing test URL cannot fall back to development. Proposed guard: test database name ends _test; only the isolated harness may prepare/clean test fixtures.

Proposed structure: client/, server/, server/prisma/migrations/, server/tests/, e2e/. Issue #2 establishes real install/migrate/seed/run/build/test commands and environment validation. This review candidate does not claim executable tooling exists.

Design now for Docker API/UI packaging and durable GCP managed database, external configuration/secrets, migrations before serving, health endpoint and logs. Actual Docker/CI/CD/GCP configuration is Lab 5. Never depend on container-local ephemeral database files for persistence.

## 9. Review gate

Pair review must confirm D-01–06, exact schemas/constraints, validation, session/CSRF lifecycle, API contracts and test plan before implementation. Record actual feedback and acceptance in GitHub; do not invent decision IDs, teammate approval, test passes or a release.
