# Sprint 1 engineering contracts (draft)

**Status:** Design draft only. The pair must review and version the contracts before implementation. All AC and tests below are planned, not passed. Freeze UI/API/data shapes and resolve referenced decisions first.

Sprint 1 scope: F-01 identity/session, F-02 request submission/retrieval, F-03 assigned approve/reject/history.

## F-01 — Identity and session

**Links:** FR-01, NFR-01, NFR-05.  
**Dependencies:** selected stack (D-06), seeded User records.  
**Flow:** seeded Requester or Reviewer logs in → server creates session → UI retrieves current identity → protected route uses server identity → logout invalidates session.

**Data:** User(id, displayName, email, passwordHash, role, active). Password hash only; real credentials excluded from Git.

**API proposal:** POST /api/session {email,password}; GET /api/session; DELETE /api/session. Never accept role or actor ID from client.

| AC | Observable outcome |
| --- | --- |
| AC-01 | Valid seeded Requester and Reviewer credentials each establish a session and GET current identity returns the matching safe ID/role. |
| AC-02 | Invalid credentials return a generic 401 and create no authenticated session; response does not reveal whether email exists. |
| AC-03 | After logout, the same client cannot call a protected endpoint; anonymous access returns 401 with no private record payload. |

| Test | AC | Level | Preconditions/input → action | Expected |
| --- | --- | --- | --- | --- |
| TEST-01 | AC-01 | API integration | Seed one account per role, correct email/password → POST login; GET current identity. | Both sessions identify correct server-side account and role; no password/hash returned. |
| TEST-02 | AC-02 | API integration | Seed account; wrong password → POST login; then GET current identity. | 401 generic error; no session established; safe fields only. |
| TEST-03 | AC-03 | API integration | Login then DELETE session; GET protected request endpoint; repeat without cookie. | Session invalidated; both protected calls 401 and expose no private data. |

## F-02 — Submit and retrieve request

**Links:** FR-02, FR-04, BR-03, BR-06, NFR-02, NFR-03.  
**Dependencies:** F-01; D-01 assignment rule; D-04 limits/currency.  
**Flow:** authenticated Requester fills form → UI displays field validation → API derives requester from session and assigns Reviewer using approved server rule → transaction stores request and submission event → Requester retrieves persisted detail.

**Proposed fields:** title, purpose, estimatedAmount, currency. Requester ID and Reviewer assignment are server-derived. Do not trust body/query identity fields.

**API proposal:** POST /api/requests; GET /api/requests; GET /api/requests/:id. Decision on whether list/details include history must be fixed in response contract.

| AC | Observable outcome |
| --- | --- |
| AC-04 | A valid Requester submission returns a stable request ID; fetching it after a fresh request context returns the same fields, PENDING_REVIEW state and server-derived owner/assigned Reviewer. |
| AC-05 | Empty title/purpose, non-positive amount, or invalid decimal precision returns field errors and stores neither request nor submission event. |
| AC-06 | Another Requester and an unrelated Reviewer cannot retrieve the detail; Reviewer cannot submit; unauthorized API calls return safe denial without private fields. |

| Test | AC | Level | Preconditions/input → action | Expected |
| --- | --- | --- | --- | --- |
| TEST-04 | AC-04 | API/DB integration | Seed Requester and eligible Reviewer; valid request → POST, discard context, GET by ID and query DB. | 201 then persisted same values, owner/assignment, PENDING_REVIEW and one submission event. |
| TEST-05 | AC-05 | Unit + API/DB integration | For each invalid field boundary, POST request. | 422 field error; no request or event row. |
| TEST-06 | AC-06 | API integration | Seed two Requesters and two Reviewers; A submits assigned request; B and unassigned reviewer GET it; reviewer POSTs create. | Safe 403/404; no private detail; forbidden create denied; DB unchanged. |

## F-03 — Assigned decision and history

**Links:** FR-03/04, BR-01–04, NFR-01/02.  
**Dependencies:** F-01, F-02, D-01/D-03.  
**Flow:** assigned Reviewer opens pending request → submits approve/reject and approved reason shape → API checks session, assignment, self-approval, current state and input → one transaction inserts Decision, updates Request and appends RequestEvent → authorized users retrieve new state/history.

**API proposal:** POST /api/requests/:id/decisions with {action: APPROVE|REJECT, reason}. Actor ID always comes from session. Return reason requirement is D-03; if not agreed, the feature is not ready to implement.

| AC | Observable outcome |
| --- | --- |
| AC-07 | Assigned Reviewer approving a pending request persists APPROVED, actor/action/reason/time and one matching history event; Requester sees it on reload. |
| AC-08 | Assigned Reviewer rejecting a pending request persists REJECTED with decision/history; decision reason follows agreed D-03 policy. |
| AC-09 | Requester, unrelated Reviewer, or any actor whose ID equals the requester's ID cannot decide; safe denial and no state/history change. |
| AC-10 | A terminal, repeated or invalid transition is rejected; concurrent attempts yield one terminal decision and one corresponding event. |

| Test | AC | Level | Preconditions/input → action | Expected |
| --- | --- | --- | --- | --- |
| TEST-07 | AC-07 | E2E + API/DB integration | Requester submits; assigned Reviewer logs in and approves; Requester reloads. | UI/API show APPROVED; persisted decision/event have actor, timestamp and approved reason shape. |
| TEST-08 | AC-08 | API/DB integration | Pending assigned request; Reviewer rejects with allowed reason → reload as Requester. | REJECTED persists with matching decision/history. |
| TEST-09 | AC-09 | API integration | Try decision as Requester, unassigned Reviewer, and controlled fixture where requesterId equals acting reviewer ID. | Each denied; request unchanged; no Decision or RequestEvent inserted. |
| TEST-10 | AC-10 | Unit + concurrent API/DB integration | Try invalid status, repeat after terminal result and two simultaneous decisions. | Invalid/repeat denied; at most one terminal outcome/event; no partial transaction. |

## Product Definition of Done

For each feature: approved/versioned contract exists before implementation; behavior and negative/boundary rules meet AC; planned tests run and meaningful assertions pass; build and focused regression pass; backend authorization/persistence are verified; substantive teammate review and integration are recorded; setup and traceability are current; incomplete/failed/skipped work is disclosed. This document itself does not establish completion.

## Contract history

- Draft created before application implementation (planning status only).
- Pair review, approval date, revisions and implementation commit: pending.
