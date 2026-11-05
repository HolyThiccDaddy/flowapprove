# Sprint 1 engineering contracts — Issue #1 review candidate

**Revision:** 5 Nov 2026, documentation only on docs/sprint-1-baseline. User selected the baseline for teammate review; no pair approval, implementation, test execution or release is claimed. Read [SRS](../../srs.md) D-01–06 and [System SDS](../../system-sds.md) with this contract. All paths/commands below are planned, not existing execution evidence.

## 1. Shared fixtures, protocol and errors

Synthetic fixture identities: Requesters A/B and Reviewers R/S. A maps to R; B maps to S. No real credentials are embedded. Tests construct missing/inactive/wrong-role mapping cases separately. Actor, assignment, state, timestamps and history always come from the server.

All protected calls use the server session. Writes require allowed Origin and X-CSRF-Token as defined by SDS. Error shape: {error:{code,message,fields?}}. Use SDS's exact 400/401/403/404/409/422/500 meanings. Authenticated record lookup outside scope returns the same 404 as an absent record. Test both response and unchanged database state on denials.

### Shared request response

{request:{id,requesterId,assignedReviewerId,title,purpose,estimatedAmount,currency,status,version,submittedAt,createdAt,updatedAt,history}}

IDs are UUID strings, timestamps UTC ISO strings, amount normalized decimal string with two fractional digits. history is an array of {id,actorId,eventType,fromStatus,toStatus,reason,occurredAt}, ordered occurredAt/id ascending. Submission event has fromStatus=null and reason=null. No user password/hash/session data appears in requests/history.

List response: {requests:[summary],nextCursor:null|string}; summary includes id,title,estimatedAmount,currency,status,submittedAt,updatedAt,assignedReviewerId. History/purpose is in detail, not the list. Cursor pagination uses submittedAt DESC, id DESC; default limit=20, permitted 1–50. Cursor must identify a valid pair; invalid cursor/limit returns 422 VALIDATION_FAILED. Apply ownership/assignment before limit/cursor. No status/date filter until F-05.

## 2. F-01 — Identity and session

**Links:** FR-01; NFR-01/05. **Dependencies:** D-06 and Issue #2 foundation. **Issue:** #3.
**Workflow:** seeded user logs in → API establishes session → UI retrieves safe identity → protected navigation uses server identity → logout revokes that session.

### Layer design

UI: /login with email/password, validation/progress/generic failure; authenticated header identifies current user and provides logout. Expiry/logout clears private views and returns to login. UI never presents an identity/role selector.

Data: User and Session as SDS, password hashes only. F-01 owns session migration/fields and seed password-hashing path; reuse foundation tables rather than duplicate migrations.

| Method/path | Input | Success | Expected failures |
| --- | --- | --- | --- |
| POST /api/session | {email,password}; trim/lowercase email, valid email max 254; password string 12–128, never trim; Origin required | 200 {user:{id,displayName,email,role},csrfToken}; Set-Cookie | 400 malformed; 401 INVALID_CREDENTIALS generic for absent/inactive/wrong password; 422 invalid shape; 403 invalid Origin |
| GET /api/session | Cookie | 200 same safe identity/CSRF shape | 401 SESSION_REQUIRED |
| DELETE /api/session | Cookie; Origin/CSRF if valid session | 204 empty; revoke current session and expire cookie | 403 CSRF_INVALID for valid-session unsafe mutation; absent/expired session still 204 |

SDS fixes proposed session lifetime (8h), cookie flags, CSRF and logout details. Wrong-role denial and authenticated expiry are enforced on all domain endpoints. Login must not log credentials or reveal account existence.

### Acceptance criteria

| AC | Observable outcome |
| --- | --- |
| AC-01 | Both seeded roles establish a session and current-user returns the correct safe identity/role. |
| AC-02 | Invalid credentials do not establish a session and return a generic error without exposing whether the user exists. |
| AC-03 | Anonymous, expired and logged-out sessions cannot retrieve protected data. Logout revokes its session; Origin/CSRF protections follow SDS. |

### STS

| Test / AC | Level / planned file | Preconditions/input and action | Expected result |
| --- | --- | --- | --- |
| TEST-01 / AC-01 | API/DB: server/tests/auth.integration.test.ts; UI: e2e/authentication.spec.ts | Seed both roles with locally supplied hashed passwords; login each, GET session and navigate authenticated UI. | 200 matching ID/role, safe fields, cookie flags; no plaintext/hash in response; actual session data persists. |
| TEST-02 / AC-02 | API/DB: server/tests/auth.integration.test.ts | Known wrong password, unknown email, inactive account; POST login then call protected endpoint. | Generic 401 for credential failures; no new authenticated session; protected call 401. Malformed shape/unsafe Origin have documented safe errors. |
| TEST-03 / AC-03 | API/DB: server/tests/auth.integration.test.ts; UI: e2e/authentication.spec.ts | Call protected API anonymously; login then logout; reuse old cookie; test expired session fixture, repeated logout and missing/invalid CSRF on a valid-session write. | 401 without private data for missing/revoked/expired sessions; 204 repeated logout; invalid CSRF/Origin gives 403 without mutation; UI removes private content. |

## 3. F-02 — Submit and retrieve requests

**Links:** FR-02/04; BR-03–06; NFR-01/02/03. **Dependencies:** F-01, D-01/02/04, Issue #2. **Issue:** #4.
**Workflow:** Requester submits valid input → server resolves mapped Reviewer → creates pending request/submission event atomically → owner and assigned Reviewer retrieve it.

### Layer design

UI: /requests, /requests/new and /requests/:id. Role-scoped lists show empty/loading/retry, status and detail link. Form has title, purpose, amount and fixed THB display; requester/assignment are not editable. Show assigned Reviewer from API. No edit/delete controls/endpoints after submission. Accessible shared states follow SDS.

| Method/path | Input | Success | Expected failures |
| --- | --- | --- | --- |
| POST /api/requests | {title,purpose,estimatedAmount,currency:"THB"} | 201 shared request object, PENDING_REVIEW, version=0, one SUBMITTED event | 401/403; 422 VALIDATION_FAILED or NO_ELIGIBLE_REVIEWER; 500 safe rollback |
| GET /api/requests | Optional limit and cursor only | 200 scoped list shape above | 401; 422 invalid query |
| GET /api/requests/:id | UUID path ID | 200 shared detail/history | 400 bad UUID; 401; 404 absent/out-of-scope |

BR-06: trim title (5–120) and purpose (10–2000); reject empty/too-short/too-long values. estimatedAmount must be a JSON string matching digits with optional dot plus 1–2 fractional digits, in 0.01–1000000.00 inclusive. Reject numbers, exponent notation, whitespace, negatives, commas and excess precision; normalize accepted amount to two decimals using exact decimal handling. currency must equal THB. Reject unknown fields (especially owner/reviewer/status/role). D-01 forbids absent/inactive/wrong-role/self mapping and guarantees no partial writes. No draft or API update/delete is introduced.

Data: User defaultReviewerId, Request and RequestEvent migration/seed as SDS. Scope reads in the database. The minimal assigned Reviewer queue is F-02; F-05 adds filters later.

### Acceptance criteria

| AC | Observable outcome |
| --- | --- |
| AC-04 | Valid submission returns stable ID and persisted fields, pending state, server owner/assignment and initial history. Authorized retrieval after API restart returns matching data. |
| AC-05 | Invalid fields, amount/currency, injected trusted fields or ineligible mapping are rejected with safe field/domain errors and no Request/Event row. |
| AC-06 | Owners/assigned Reviewers can list/read their records. Other Requesters/unassigned Reviewers cannot read details/history or discover them in lists; Reviewer submission is forbidden. Submitted fields have no edit/delete operation. |

### STS

| Test / AC | Level / planned file | Preconditions/input and action | Expected result |
| --- | --- | --- | --- |
| TEST-04 / AC-04 | API/DB: server/tests/requests.integration.test.ts; restart: server/tests/persistence.integration.test.ts; UI: e2e/request-submission.spec.ts | A submits mapped to R; inspect DB, GET as A/R. Stop API process and start it again against same isolated DB, log in again and retrieve. | 201 stable request; 200 matching persisted values/assignment, one submission event, pending state; same data survives actual API restart. UI journey works. |
| TEST-05 / AC-05 | Unit: server/tests/request-validation.test.ts; API/DB: server/tests/requests.integration.test.ts | Test text boundaries (4/5/120/121; 9/10/2000/2001), money 0/0.01/1000000.00/1000000.01, excess precision, numeric/exponent input, non-THB, injected fields and missing/inactive/wrong-role/self mapping. | Valid boundary inputs accepted; invalid input 422 with correct safe code/fields; no partial request/history writes. |
| TEST-06 / AC-06 | API/DB: server/tests/requests.integration.test.ts; UI/manual as section 5 | Create A→R request; list/read as A/R/B/S, anonymous; Reviewer POST; attempt unsupported edits/deletes; invalid UUID/cursor and pagination boundary checks. | A/R see only permitted data; B/S detail/history 404 and lists exclude A's request; anonymous 401; Reviewer POST 403; no editable operation/no mutation; malformed/query errors follow contract. |

## 4. F-03 — Assigned decision and history

**Links:** FR-03/04; BR-01–04; NFR-01/02/03. **Dependencies:** F-01/F-02, D-01/03, agreed transaction design. **Issue:** #5.
**Workflow:** assigned Reviewer opens pending detail → chooses approve/reject → API checks role/assignment/self/state → atomic terminal change/decision/history → Requester retrieves outcome.

### Layer design

UI: detail shows decision controls only for assigned Reviewer on pending request; reason follows D-03. Prevent duplicate in-flight action; show 409 conflict and refresh when another decision wins. Owners read history without review controls. Preserve draft reason on validation/network errors and avoid automatic decision retries.

POST /api/requests/:id/decisions accepts {action:"APPROVE"|"REJECT",reason?:string|null,expectedVersion:integer>=0}. Unknown fields are invalid. Trim reason; rejection requires 1–1000 characters; approval accepts missing/null/empty reason as null or up to 1000 characters. Success: 200 shared request shape with terminal status, incremented version and complete authorized history.

Failures: 400 malformed UUID/JSON, 401 no session, 403 wrong-role/self or CSRF failure, 404 missing/out-of-scope, 422 invalid action/reason/version, 409 invalid/repeated/stale/concurrent decision, 500 safe unexpected failure. Assignment check precedes state information to prevent leaks.

Data: Decision and RequestEvent; update Request. Conditional version/pending update and unique terminal decision constraint from SDS must run in one transaction. No API exists to change actor/time or edit history. No new UI route is needed; existing detail gains review/history rendering. S1 has no return or second-stage action.

### Acceptance criteria

| AC | Observable outcome |
| --- | --- |
| AC-07 | Assigned Reviewer approves pending request; owner retrieves APPROVED, actor/time, optional reason and one matching terminal history entry. |
| AC-08 | Assigned Reviewer rejects pending request with required reason; owner retrieves REJECTED and matching persistent decision/history. |
| AC-09 | Requester, unassigned Reviewer and self-approval are denied without exposing unrelated data or changing state/history. |
| AC-10 | Invalid/repeated/stale/concurrent decisions cannot create multiple terminal outcomes or partial history. Only a pending request can transition, exactly once. |

### STS

| Test / AC | Level / planned file | Preconditions/input and action | Expected result |
| --- | --- | --- | --- |
| TEST-07 / AC-07 | API/DB: server/tests/decisions.integration.test.ts; UI: e2e/approval-flow.spec.ts | A submits, R logs in and approves with current version; test absent/empty/nonempty valid reason; A retrieves. | 200 APPROVED, version increments once, one Decision/terminal Event with server actor/time and normalized reason; UI displays persistent result. |
| TEST-08 / AC-08 | API/DB: server/tests/decisions.integration.test.ts | Pending assigned request; reject valid reason; test missing/blank/1001-character reason before valid decision; retrieve after new context/restart fixture. | Invalid reason 422, no writes; valid reason gives REJECTED, matching actor/time/history and durable result. |
| TEST-09 / AC-09 | API/DB: server/tests/decisions.integration.test.ts; unit: server/tests/decision-rules.test.ts | Requester attempts review (403); S attempts A→R review (404); anonymous attempt (401). Controlled unit input sets actor=requester with Reviewer permission to reach self guard; normal assignment/schema also rejects self mapping. | Safe denials and unchanged Request/Decision/Event counts. Unit guard rejects self even if role/assignment would otherwise pass; never weaken production DB constraints to insert an impossible fixture. |
| TEST-10 / AC-10 | Unit: server/tests/decision-rules.test.ts; concurrent API/DB: server/tests/decisions.integration.test.ts | Try terminal request, stale expectedVersion, invalid action, repeat after success, and two simultaneous valid competing decisions. Inject failure inside transaction for rollback test. | Invalid action 422; repeat/stale/terminal conflict 409. Concurrent valid requests: exactly one succeeds, other 409; one terminal Decision/Event. Injected failure rolls back state/version/history with safe 500. |

## 5. Cross-cutting verification and commands

NFR-03 / SYS-01 (UI-CHECK-01, manual): inspect /login, /requests, /requests/new and /requests/:id at 375/768/1280 CSS px; keyboard/focus, labels/errors, loading, empty, failure/retry, submitting and terminal states. Record actual browser, viewport, Feature/AC, steps and observed result. Selected e2e files above automate critical journeys; manual checks supplement them.

NFR-05 (SEC-CHECK-01): inspect hash creation/storage and sanitized environment examples, review repository diff/history for accidental secrets without printing them. Record actual method/result; not a claim of a completed scan.

Proposed tooling/command contract for Issue #2 validation:
- From server/: npm test -- --run, npm run build, npm run db:migrate, npm run db:seed.
- From client/: npm test -- --run, npm run build, npx playwright test.
- Test migration/seed must use an explicit guarded test command/configuration established in Issue #2; never reuse a production/default URL for cleanup.
These are proposed script names, not commands available now. Issue #2 must implement/verify or revise them and update README before execution is claimed.

Before implementation, retain this contract revision in history. For meaningful rules, capture intended failing tests, minimal correction and passing tests with actual commit/output. TDD candidates: money boundary, no-self guard and conditional terminal transition. Every test family above must record subcase names, real file, command, counts and tested version when executed.

## 6. Product DoD and review readiness

Feature DoD: agreed versioned contract precedes implementation; required behavior/negative cases meet AC; planned meaningful tests and applicable builds/regressions actually execute; backend authorization/persistence verified; UI/manual checks recorded; teammate review/integration genuine; setup/traceability current; incomplete/failed/skipped work disclosed.

Release DoD: integrated acceptance/build/tests on the submitted version, identifiable reviewed staging→main release, reproducible local setup, accurate evidence. No commit on main is permitted by the current user instruction; release promotion is a later separately authorized step.

Issue #1 review gate: reconcile IDs, specify all layers/STS, and present D-01–06 for real teammate review. The draft is not implemented or approved merely because it exists. Pair review, actual review findings/resolutions, version/commit, merge into staging and Issue closure are pending.

## 7. Revision record

- Existing repository draft predates this Issue's implementation; retain Git history.
- 5 Nov 2026: user selected baseline for teammate review. Agent reconciled BR/D references, documented one-stage scope, exact proposed validation/API/session/transaction behavior and planned test locations. No code/tests executed and no teammate sign-off invented.
- Teammate review/date, acceptance revision and implementation commits: pending.
