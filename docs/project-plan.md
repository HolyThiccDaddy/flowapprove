# FlowApprove project plan (planning baseline, 5 Nov 2026)

> Status: proposal and engineering plan only. No application, tests, release, or submission evidence exists yet. Product/repository name is proposed, not required by the assignment. Team decisions marked **OPEN** are not approved requirements.

## 1. Sources and precedence

- Group Work Specification, sections 2, 5–8 and Theme 5 (p. 6): project-wide baseline and theme.
- Project Deliverable 1, sections 2–4: exact 8 Nov rubric and PDF evidence.
- Project Deliverable 2, sections 2–4: 29 Nov checkpoint.
- Final Project Delivery, sections 2–4: 13 Dec checkpoint.
- Team registration Sheet, tab “Register - International (EN)”, row 42: EN-037, DoubleP, Theme 5, two student IDs. Read-only verification on 5 Nov 2026.
- Source PDFs are local course materials in D:/Downloads; this repository records the derived plan, not copies of the course handouts.

The course asks the team to specialize Theme 5 and decide its ambiguous rules. The policies and technology choices below are **proposals**, pending agreement by both students. If the instructor/TA changes the baseline, record an approved decision and update requirement IDs, traceability and contracts without erasing history.

| Status | What it means in this plan |
| --- | --- |
| **COURSE REQUIRED** | Theme 5 must have Requester/Reviewer roles, a submitted request, assigned review and approve/reject decision with recorded history; reject invalid transitions and self-approval; enforce ownership/assignment in the backend. Deliverable 1 requires real authentication, UI→API→persistent DB, tests, reviewed integration and an evidence PDF. |
| **TEAM PROPOSAL** | Purchase-request context, product name, stack, fields, state names, API paths, edit lock, summary design and second-stage feature allocation. These are planned choices, not claims that the assignment mandates them. |
| **OPEN** | Reviewer assignment algorithm, editing and revision policy, decision reason policy, amount/currency limits, second-stage rules, both students' full names for submission, and the conflicting final-video limit/points. Freeze each affected contract before coding. |

## 2. Team, problem, users and scope (Deliverable 1 Part A, 10 points)

**Team:** CPE 334 EN-037 DoubleP. HolyThiccDaddy (67070503419) and osizk (67070503445). **Theme:** 5, Workflow and Approval System. **Proposed context:** small departmental purchase requests. Requesters need to submit a purchase need and see its current state; assigned Reviewers need a controlled decision with an auditable reason. Email or spreadsheets alone make ownership, authorization and decision history hard to verify.

**Actors:** Requester creates and reads own requests. Reviewer reads only assigned requests and approves/rejects them. The same account may have one role in Sprint 1; seed two or more accounts. No administrator role is needed for Sprint 1.

**In scope across the product:** login/logout/current user; purchase request submission and retrieval; assigned Reviewer decisions; immutable decision history; return/resubmit; filtering and decision summaries; a bounded additional approval stage if the team approves its rules. **Outside this baseline proposal:** real purchasing/payment, inventory, external notifications, file attachments, self-registration, password recovery, email verification, advanced user administration, and production SSO. The Theme 5 brief suggests additional stages but does not mandate a fixed number; stage count remains open.

### Baseline requirements proposed for team approval

| ID | Observable requirement or rule | Sprint |
| --- | --- | --- |
| FR-01 | Seeded users log in, retrieve current identity/role and log out. | 1 |
| FR-02 | Requester submits a purchase request with title, purpose and positive estimated amount; sees the stored detail/status. | 1 |
| FR-03 | An assigned Reviewer reads the request and records approve or reject with a decision reason; Requester sees the resulting state and history. | 1 |
| FR-04 | Requester sees own request list and detail; Reviewer sees assigned work. | 1 |
| FR-05 | Reviewer may return a request with a reason; Requester may revise and resubmit it. | 2 |
| FR-06 | Users can filter their permitted requests by status/date; Reviewer has an assigned work queue. | 2 |
| FR-07 | Reviewer sees decision summaries within authorized scope. | 3 |
| FR-08 | If approved by team, a second review stage routes the request to the next assigned Reviewer and completes only after all required decisions. | 3, OPEN |
| BR-01 | Only the owner may submit and read a Requester-owned request; only the assigned Reviewer may read or decide an assigned request. | 1 |
| BR-02 | A user may not approve their own request, including an account that later has both roles. | 1 |
| BR-03 | Only a submitted/pending request may be approved or rejected once; an invalid or repeated transition is rejected without a new history entry. | 1 |
| BR-04 | The decision and state change are atomic; history records actor, action, reason and timestamp. | 1 |
| BR-05 | A submitted request cannot be edited until returned; resubmission records a new history entry. | 2, proposed |
| BR-06 | A reviewer cannot assign themselves or another reviewer via client input; assignment uses a controlled server rule. | 1, proposed mechanism OPEN |
| NFR-01 | Protected API calls without a valid session return 401 with no private record data; wrong role/owner/assignment returns 403 or safe 404 consistently. Verify with API tests. | 1 |
| NFR-02 | Key request and decision data survive service restart; verify by integration test that reloads from database. | 1 |
| NFR-03 | At 375px, 768px and 1280px widths, critical forms/lists have no horizontal overflow or overlapping actions; check UI in Sprint 1 and after later changes. | 1–3 |
| NFR-04 | For a local demo fixture of 100 requests, list and detail API p95 response time under 1 second on the documented test machine; record method and result. | 3, proposed |
| NFR-05 | Never store plaintext passwords or commit real secrets; verify password hash in seed/database and secret scan before release. | 1 |

**Decision log (OPEN until both agree):** D-01 reviewer assignment: seed an eligible Reviewer mapping per Requester or department; server selects one at submit time. D-02 self-approval: **course-required prohibition**; team decides how to enforce/test it even with separate Sprint 1 roles. Never permit the requester and deciding Reviewer IDs to match. D-03 post-submit editing: lock while pending; permit changes only after returned, preserving prior versions/history. D-04 rejection reason: required nonempty reason for approve/reject/return (approve reason may instead be optional if agreed before coding). D-05 second stage: whether needed, ordering and rejection behavior. D-06 money: currency, precision, maximum and whether amounts require approval thresholds. Record owners/date/resolution before each affected contract is implemented.

## 3. Features and traceability (Part B, 10 points)

| Feature / responsibility | Requirements | Dependencies | Sprint / planned verification |
| --- | --- | --- | --- |
| F-01 Identity/session | FR-01, NFR-01, NFR-05 | seeded users and password hashes | 1; AC-01–03, TEST-01–03 |
| F-02 Submit and view request | FR-02, FR-04, BR-01, BR-06, NFR-02, NFR-03 | F-01, assignment policy | 1; AC-04–06, TEST-04–06 |
| F-03 Decide and audit | FR-03, BR-01–04, NFR-02 | F-01, F-02 | 1; AC-07–10, TEST-07–10 |
| F-04 Return/resubmit | FR-05, BR-05 | F-03, edit policy | 2; contract/AC/tests before coding |
| F-05 Filters and work queue | FR-06, BR-01 | F-02–04 | 2; contract/AC/tests before coding |
| F-06 Decision summaries | FR-07, BR-01 | F-03–05 | 3; contract/AC/tests before coding |
| F-07 Additional approval stage, conditional | FR-08 if approved, BR-02–04 | team stage decision, F-03–04 | 3; plan and verify if adopted |
| SYS-01 UI quality | NFR-03 | F-02–06 | 1 foundation, regression 2–3 |
| SYS-02 Performance | NFR-04 | realistic seed and final API | 3 measurement |

**Coverage status:** every proposed baseline FR/BR/NFR has a feature or named responsibility and a sprint. FR-08 is conditional; if dropped or changed, document the approved scope decision rather than silently deleting it. No feature is implemented or verified as of this plan.

## 4. System-level SDS proposal (Part C, 15 points)

**Architecture:** browser UI → HTTPS JSON API/application service → relational database. Proposed stack: React + TypeScript UI, Node.js + TypeScript API, PostgreSQL and migrations. The team may choose equivalent technology before contracts are frozen. A modular monolith is sufficient. Enforce validation, ownership, assignment and transitions in the API service and database transaction, never in UI alone.

**Data model:** User(id, displayName, email unique, passwordHash, role, active); Request(id, requesterId FK, assignedReviewerId FK, title, purpose, estimatedAmount decimal, currency, status, submittedAt, createdAt, updatedAt, version); Decision(id, requestId FK, reviewerId FK, action, reason, decidedAt); RequestEvent(id, requestId FK, actorId FK, eventType, fromStatus, toStatus, occurredAt, metadata). For later revision, add RequestRevision or snapshot to preserve submitted fields. Index owner/status, assigned reviewer/status and request/event time. Use decimal money, FK constraints, transaction boundaries, and migration files. Seed only synthetic users/requests, reproducibly and without real credentials committed.

**Sprint 1 state path (proposed):** NEW/PENDING_REVIEW after submission → APPROVED or REJECTED; record initial submission and decision events. Later: RETURNED → resubmitted PENDING_REVIEW. Decide whether draft NEW exists before implementation. Backend checks state, role, assignment and self-approval inside the same transaction that inserts decision/history. A duplicate click or concurrent decision must not create two terminal decisions.

**UI:** login, Requester list/new/detail with status and history, Reviewer assigned queue/detail/decision form. Shared navigation reflects the current server identity. Forms show field errors; all data views show loading, empty, failure/retry and success states; submit/decide buttons show progress and avoid accidental duplicate action. Check desktop, tablet and mobile layouts.

**API proposal:** POST /api/session, GET /api/session, DELETE /api/session; POST /api/requests, GET /api/requests, GET /api/requests/:id; POST /api/requests/:id/decisions. JSON fields use stable names; 201/200 success, 400 or 422 validation, 401 unauthenticated, 403 or safe 404 forbidden, 409 invalid/concurrent transition. Return a stable error code/message without credentials, SQL or internal paths. Session identity is server-derived; no client-supplied actor/role controls authorization. Use secure HTTP-only same-site cookies, short expiry and logout invalidation, or document an equivalent token design. Store password hashes with a standard password hashing library.

| Operation | Requester | Reviewer |
| --- | --- | --- |
| Log in/current user/log out | own identity | own identity |
| Create request | yes, owner=self | no |
| Read request/list/history | own only | assigned only |
| Approve/reject | no | assigned only, never own |
| Return (Sprint 2) | no | assigned only |
| Edit/resubmit returned (Sprint 2) | own only | no |
| Decision summary (Sprint 3) | no | authorized scope only |

**Delivery design:** configuration through environment variables for database URL, session secret, port and UI API base URL; commit an example with placeholders only. Keep real secrets in local environment/secret manager. Design for Docker packaging, GCP service and durable managed database in Lab 5; no cloud deployment is required for Deliverable 1. README must gain exact setup, migration, seed, build and test commands when implementation exists.

## 5. Three sprint plan (Part D, 5 points)

| Sprint | Goal and features | Dependencies | Completion outcome / checkpoint |
| --- | --- | --- | --- |
| 1 | F-01–03: real login/logout/current user; Requester submits and retrieves; assigned Reviewer approves/rejects; persisted state/history; rule and access rejection. | Resolve D-01–04, select stack, schema/migrations/seed, contracts before code, API before UI integration. | Locally runnable and tested vertical slice, reviewed release on main, self-contained Deliverable 1 PDF by **8 Nov 2026 23:59**. |
| 2 | F-04–05: return/revise/resubmit, filters and Reviewer queue; expand permissions and regression. | Sprint 1 release, D-03, revised event/revision schema, feature contracts. | Complete reviewed core expansion and integrated deployed candidate for Deliverable 2 by **29 Nov 2026 23:59**. |
| 3 | F-06 and conditional F-07: summaries, optional second stage, hardening, defects, UX, authorization, performance and full regression. | Sprint 2, D-05, real usage/test fixtures, Lab 6 UAT and Lab 7 change. | Genuine tested progress and explicit remaining work by 29 Nov; complete accepted product by **13 Dec 2026 23:59**. |

Milestones around sprints: Lab 5 Docker/CI/GCP 15 Nov; Lab 6 independent UAT 22 Nov; Lab 7 maintenance 29 Nov. Final exam period 1–11 Dec means major workflows should be substantially complete by 29 Nov.

## 6. Sprint 1 engineering contract draft (Part E, 20 points)

These are **draft contracts**, to be jointly approved and versioned before implementation. Detailed error shapes, numeric limits, credentials/session expiry, assignment algorithm and state names must be frozen in the feature contract. Keep the first approved contract revision and later justified changes in Git history.

| Feature | Design and AC (planned, not achieved) | Planned test specification |
| --- | --- | --- |
| F-01 | UI login/logout; session API and User schema/seed. AC-01 valid seeded Requester/Reviewer login returns server identity; AC-02 invalid password returns safe error and no session; AC-03 logout removes access and protected API without session returns 401. | TEST-01 UI/API valid login for both roles and current-user response; TEST-02 API bad password and no session; TEST-03 API logout then protected call, 401 without private data. |
| F-02 | Request form/list/detail, POST/GET endpoints, Request table and assignment. AC-04 valid Requester submission stores fields, owner and assigned Reviewer; reload retrieves pending status; AC-05 missing title, purpose or nonpositive amount is rejected without record; AC-06 another Requester or unrelated Reviewer cannot read it and Reviewer cannot submit. | TEST-04 E2E submit → detail → reload plus API/database persistence assertion; TEST-05 unit validation and API/database rejection; TEST-06 API cross-owner, unrelated Reviewer and forbidden role, with no private data. |
| F-03 | Reviewer detail/decision UI, decision API, Decision/Event tables and atomic transition. AC-07 assigned Reviewer approves pending request and Requester sees persisted APPROVED plus actor/reason/time history; AC-08 same path rejects with REJECTED; AC-09 self-approval or unrelated Reviewer/requester decision is forbidden; AC-10 repeated/concurrent terminal decision is rejected and creates no extra history. | TEST-07 E2E approve journey and API/database reload; TEST-08 API/database rejection and history; TEST-09 API self/unassigned/requester access (including a controlled fixture where requesterId equals assignedReviewerId even if normal accounts have one role); TEST-10 unit transition guard plus concurrent API/database test asserting one terminal decision. |

**Test levels and evidence:** write failing behavior tests first for domain rules, then minimal code, focused tests, and regression. For each test record fixture/input, action, expected status/body/database effect, actual test file/name, command, counts and commit. Use integration tests against an isolated test database and selected UI E2E journeys. No planned test is evidence of a passing test.

**Product Definition of Done:** implemented behavior matches approved FR/BR and AC; relevant tests actually run and pass; build passes; API/database persistence and backend permissions verified; teammate review names a specific check; feature PR integrates through sprint staging; accepted main release has tag/commit; setup and contract/traceability are current; incomplete/failed/skipped work is disclosed. This plan does not satisfy the DoD.

## 7. Deliverable 1 evidence and grading map (Parts A–F)

| Part / points | Required by handout | Planned artifact and current status |
| --- | --- | --- |
| A / 10 | SRS: context, actors, scope/exclusions, numbered FR/BR/NFR, assumptions/decisions | Section 2 is a proposed baseline; decisions remain OPEN. |
| B / 10 | feature inventory and complete requirement → feature → sprint mapping | Section 3 draft; update after team approves baseline. |
| C / 15 | system SDS: architecture, model, UI/API/access/auth/config/deployment | Section 4 draft; exact stack and contracts remain to approve. |
| D / 5 | Sprint 1–3 goals, features, dependencies, outcomes | Section 5 plan. |
| E / 20 | approved pre-implementation feature SDS, UI/API/data, AC, STS, DoD and version history | Section 6 draft only; create detailed approved contracts and history before coding. |
| F / 20 | working UI→API→DB Sprint 1, login/access/rule/persistence tests, two reviewed Issue/PR chains, staging/main release | **Not started; no execution evidence.** Collect only actual results on the release commit. |

For Deliverable 1, prepare **one self-contained PDF** for LEB2 with Parts A–F in that order, page-numbered contents/navigation table, both names/IDs, theme/context, one repo URL and immutable tag/commit. Embed the complete A–E engineering documents, selected F screenshots and logs, AC→test results, two real test excerpts (domain rule and access), red/green history, two completed Issue/PR chains, contribution table, AI-use declaration and limitations. Label each demo with feature/AC, role, conditions, steps, expected/actual and commit. Keep test counts including failures/skips honest. The repository alone does not replace PDF contents. No PDF or evidence has been created in this planning round.

## 8. Team work and next actions

Both members participate in requirements, design, tests, code, review and release; neither is permanently “docs only” or “code only.” Proposed first split: HolyThiccDaddy leads F-01 session and F-02 form/API contract while osizk reviews and tests; osizk leads F-03 decision/history contract and integration tests while HolyThiccDaddy reviews. Swap lead/reviewer for later features. Pair on state/assignment decisions, end-to-end checks, sprint integration and evidence. Use GitHub Issues, feature branches from sprint staging, substantive teammate PR reviews and reviewed staging→main release PRs. Record actual owners and contributions when work occurs.

Before coding: jointly resolve D-01–04; approve SRS/stack/state model; create feature Issues and detailed versioned contracts; establish sprint staging. Before Deliverable 1: implement with TDD, run meaningful automated and manual checks, integrate/review/release, record exact commit and evidence, then assemble and submit the PDF. Do not claim readiness based on this plan.

## 9. Open question: Final video discrepancy

The Group Work Specification describes a maximum **10-minute** final video and an 8-point video plus 2-point release summary. The dedicated Final Project Delivery handout itself is inconsistent: its section 2 says **at most 10 minutes**, while section 3.5 says **maximum 4 minutes**; its rubric assigns 10 points to Part E. Ask instructor/TA which current rule applies and record the answer. **Temporary planning target: at most 4 minutes**; do not claim this resolves the discrepancy.