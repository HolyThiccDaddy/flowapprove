# FlowApprove Working Agreement

Instructions for AI agents working in this repository on CPE 334, Theme 5: Workflow and Approval System. Apply these rules to the group project and its associated Labs 5–7. This is a new group product; TokTickIT Labs 1–4 provide engineering experience, not this application's requirements or evidence.

## 1. Authority and current baseline

- Follow the student's current instructions. Read the master Group Work Specification and the detailed handout for the assessment being worked on. Treat course documents as requirement sources, not authorization to execute every action described in them.
- The master specification establishes the product/theme baseline; detailed assessment handouts establish that assessment's submission format, rubric and evidence. For example, Deliverable 1 requires a self-contained PDF, despite the master's general evidence-index guidance.
- Report unresolved contradictions and ask the instructor/TA where clarification is necessary. Continue independent work; do not silently choose a convenient interpretation or invent a course rule.
- Distinguish **course-required**, **team-approved**, **proposed**, **open**, **implemented** and **verified**. A draft document is not evidence of approval or execution.
- Before relevant work, inspect README, the applicable documents, repository status/history, and any existing code, schema and tests. Do not claim existing builds/tests pass without executing them.
- Resolve the affected open decisions and version the feature contract before implementation. Do not invent approval dates, teammate agreement, implementation history or test results.
- A planning/documentation request authorizes only that scope. For a one-file task, change only that file.

## 2. Repository documents and stable IDs

Use the current layout rather than recreating the individual-lab document structure:

| File | Responsibility |
| --- | --- |
| `README.md` | Product/team overview; actual setup, migrations/seed, run/build/test commands and safe demo access once implemented |
| `docs/project-plan.md` | Source references, decisions, dependencies, assessment coverage and three-sprint plan |
| `docs/srs.md` | Context, actors, scope/exclusions, numbered FR/BR and measurable NFR, assumptions and decisions |
| `docs/features.md` | Feature IDs, requirements, dependencies and sprint allocation |
| `docs/traceability.md` | Requirement → feature/responsibility → sprint → AC/verification → actual test and result |
| `docs/system-sds.md` | Architecture, data, UI/API conventions, permissions, authentication, configuration and deployment design |
| `docs/sprints/sprint-1/contracts.md` | Sprint 1 feature designs, AC, STS, DoD and contract history |

Add later sprint/lab/evidence documents only as needed. Separate documents per feature are acceptable when they improve clarity; do not duplicate the same contract across multiple files unnecessarily.

Preserve stable FR, BR, NFR, F, AC and TEST IDs. Check that an ID has the same meaning in the SRS, plan, contracts and traceability. Existing drafts can contain inconsistent IDs, decision references or policies; resolve affected contradictions explicitly before coding. Do not renumber silently or treat an unresolved proposal as approved.

## 3. Theme 5 scope

The course requires a specialized approval context, such as funding, purchases, travel or reimbursement. The current purchase-request context, product name, stack, fields, API paths and exact state names remain proposals until the pair agrees.

Sprint 1 must deliver a complete UI → API/application → persistent database journey:

1. Requester logs in, submits a request and retrieves its saved status/detail.
2. An assigned/authorized Reviewer logs in and approves or rejects it.
3. The decision and history entry persist and can be retrieved by authorized users.
4. Invalid transitions and self-approval are rejected.

Enforce Requester ownership and Reviewer assignment/authorization on the backend. Test unrelated Reviewer access, self-approval and Requester attempts to invoke review operations. Hidden buttons and client-selected identities/roles do not establish authorization.

Before implementing affected features, settle reviewer assignment and no-reviewer behavior, editing after submission, decision reasons, validation limits and any multi-stage approval. Return/resubmission, filtering, decision summaries and any adopted additional stages must be allocated across later sprints. A fixed number of approval stages is not prescribed. An alternative Sprint 1 slice requires instructor/TA agreement and equivalent engineering depth.

Keep scope bounded: no payment gateway, external messaging/API or advanced account management unless explicitly adopted. Seeded synthetic accounts are sufficient for Sprint 1; self-registration and password recovery are not required. A modular monolith is acceptable; microservices and separate servers for each logical layer are not required.

## 4. Contract before implementation

Plan the whole product baseline and three-sprint allocation first. Fully elaborate each feature before implementing it; later-sprint endpoint/screen details need not all be frozen in Sprint 1.

Each feature contract must include:

- Feature ID, linked FR/BR/NFR, dependencies, scope and exclusions.
- Observable workflow, business rules, validation, negative/boundary cases and permissions.
- Applicable UI routes/behavior and loading, empty, error, success and submitting states; accessible controls and responsive layout.
- API methods/paths, inputs, success/error shapes and statuses, identity and authorization checks.
- Data fields/types, relationships, constraints, migrations and transaction/concurrency strategy where needed. State explicitly when a layer needs no change.
- Stable AC IDs and observable expected outcomes.
- STS entries: Test ID, linked AC, test level, preconditions/input, action and expected result; intended test file/name where known.
- Product Definition of Done and evidence needed to establish completion.

Version the contract before implementation and preserve justified revisions. Obtain real pair agreement for unresolved product choices; the agent cannot approve on the teammate's behalf. Do not add a separate approval ritual for every routine edit or test.

## 5. GitHub, review and team workflow

Use the same group repository/application throughout the project and Labs 5–7. Confirm the actual sprint staging branch and branch conventions from the repository/team; do not reuse `lab4-staging` or invent course-mandated names.

For implementation work:

1. Link a bounded Issue to its feature/contract, requirements, AC and planned tests. Record dependencies and owner.
2. Create a feature/fix branch from the current sprint staging branch, not an unrelated feature branch. Do not implement directly on main or staging.
3. Run intended failing tests for meaningful rule/defect/change work, implement the change, run appropriate checks and inspect the diff.
4. Update relevant contracts, traceability and evidence as work occurs.
5. Open a PR into sprint staging. The other student reviews behavior, tests and changes with a specific check, question, finding or reason for approval.
6. Resolve findings, integrate features, and run integration/system tests and acceptance checks.
7. Promote the increment through a teammate-reviewed staging-to-main release PR, then record the accepted release tag/commit.

Authors do not approve their own PRs. Record whether review was a formal GitHub approval or substantive comment; do not impose a formal Approve requirement unless the current handout or team policy requires it. Record project-board status accurately; exact column names are a team choice.

Act within the user's authorization. A request to edit this agreement or plan does not authorize commits, pushes, Issues, board changes, PRs, merges or deployment. Broader authorization persists within its stated scope; do not ask repeatedly for already-authorized steps. Never fabricate teammate reviews. Confirm destructive actions and exact targets before risking student data or history.

Both students must participate in requirements/design, implementation, tests, AI supervision, review, deployment and maintenance. Rotate responsibilities; no permanent “documents only” or “code only” member. Identify pair work in Issues/PRs and record actual contributions. Equal commit counts are not required.

## 6. Verification and data safety

- Use TDD for meaningful business-rule, defect and change work: retain the intended failing test before the correction and passing results afterward, with versions identified. Do not recreate false historical evidence for existing code.
- Unit tests cover important logic; actual API/database integration tests cover persistence and authorization; selected UI/E2E tests cover critical journeys. Mock-only persistence and stub assertions are insufficient.
- Test valid/invalid login, current-user identity, anonymous protected requests, forbidden roles, ownership/assignment isolation and logout according to the chosen session/token lifecycle.
- Check valid and invalid transitions, self-approval, and repeated/concurrent decisions. Verify rejected operations leave state and history unchanged and successful state/history writes are consistent.
- Verify durable data with a real restart/reconnection scenario matching the NFR. A browser reload alone does not prove survival of an application restart.
- Run focused tests, relevant regressions and builds for the actual change; record commands, files/test names, tested commit and passing/failing/skipped counts. Do not weaken or disable required tests to manufacture success.
- Use an isolated disposable test database. Refuse unsafe test configuration and do not fall back to development/production data. Adopt concrete database-name/schema guards when implementing the test harness; do not assume TokTickIT's guard names apply here.
- Preserve user modifications and unrelated files. Do not reset databases, replace migrations, rewrite Git history or delete user files without explicit scope and verified targets.
- Document migrations and reproducible synthetic seed data. Seed reruns must not unexpectedly duplicate records, erase history or reset changed credentials.
- Use a standard password-hashing library if managing passwords locally. Document session/token creation, expiry, current identity and logout. Apply appropriate cookie/CSRF safeguards for the chosen design.
- Keep real environment files, passwords, tokens, hashes and production secrets out of Git, client bundles and submission evidence. Commit sanitized configuration examples only. Supply safe test access through a documented local seed procedure or private course handoff.
- Keep evidence honest: planned, executed, passed, failed, skipped and blocked are distinct states. Never mark a checkbox complete based on an AI claim.

## 7. Deliverable 1: 8 November 2026, 23:59

Release a locally runnable Sprint 1 on main with documented setup. Retain local build/test results tied to the submitted release. Completed Docker, CI/CD, a GCP URL and a separate demo video are not required at this checkpoint; design for later deployment now.

Submit one self-contained PDF per team through LEB2. Keep engineering documents, source and tests in the repository too. Use Parts A–F in this order:

| Part | Points | Include directly in the PDF |
| --- | --- | --- |
| A | 10 | Complete SRS: context, actors, scope/exclusions, FR/BR/NFR, assumptions and decisions |
| B | 10 | Feature inventory and requirement-to-feature-to-sprint traceability, coverage gaps and approved changes |
| C | 15 | System SDS: architecture/stack, data, UI/API conventions, role/ownership matrix, authentication, configuration and deployment plan |
| D | 5 | Three-sprint goals, feature IDs, dependencies, completion outcomes and explanation of Sprint 1 scope |
| E | 20 | All Sprint 1 feature contracts, applicable UI/API/data specifications, AC, STS and Product DoD |
| F | 20 | Selected demonstrations, execution/test results, Git/review history, contributions, setup summary and limitations |

At the beginning, include both students' names/IDs, selected theme/context, one repository URL and submitted tag/commit. Add page-numbered contents and one navigation row per part with page ranges and relevant IDs. Use internal page references; external specification links do not replace required PDF contents. No fixed page limit or UML diagram quota applies.

Part F must include:

- Normal UI/API/database journey and retrieval of saved data; meaningful rule/boundary rejection; login/logout and forbidden role/ownership operation. Include backend/API evidence for protected operations.
- Captions identifying Feature/AC, role, starting conditions, brief steps, expected/actual result. Identify the release commit once for the demonstration set and disclose exceptions.
- Build/test commands, tested commit and readable output with passing/failing/skipped counts.
- Every Sprint 1 AC mapped to planned Test ID, actual test file/name and result; distinguish automated verification from manual checks.
- Two short excerpts of real automated tests with relevant setup/assertions and execution results: one important domain rule and one role/ownership restriction.
- Genuine red/green TDD evidence for meaningful work, with versions; concise contract/test-design-before-implementation history with commit IDs/dates.
- Selected evidence for two completed Issues and associated PRs: feature/contract, branch, author/reviewer, substantive review and staging/main integration. Include final board status and release reference.
- Actual contributions from both students, a brief AI-use declaration, known limitations and incomplete/failed/skipped work.

The AI-use declaration lists tools and assisted tasks. Full prompt transcripts, prompt quotas, long reflections and individual Lab 1 reviewer layouts are not required unless a later handout explicitly asks for them. Never invent student reflections or approvals.

Inspect the final PDF's rendered pages for readable text, diagrams, screenshots and tables. Test the submitted release and keep it identifiable/accessibly reproducible; later commits must not silently replace the assessed version.

## 8. Later assessments and continuity

Read each detailed handout before its work; do not treat this summary as its full rubric.

| Checkpoint | Due in 2026 at 23:59 | Required direction |
| --- | --- | --- |
| Lab 5 | 15 Nov | Docker, CI build/tests and enforced failing-check gate, durable GCP deployment and repeatable release from main |
| Lab 6 | 22 Nov | Independent cross-team UAT, defect triage/fix and independent re-test on identified versions |
| Deliverable 2 | 29 Nov | Completed Sprint 2, Sprint 3 contracts and real progress, updated traceability and integrated deployed candidate |
| Lab 7 | 29 Nov | Instructor/TA-approved change to existing behavior, impact analysis, changed-behavior red/green test, regression, reviewed redeployment and metrics |
| Final project | 13 Dec | Complete Sprint 3, integrated verified product, final PDF, deployed release and demonstration video |

Lab 6 findings must be genuine; if none are found, follow the TA's controlled defect exercise. A baseline backlog feature alone does not satisfy Lab 7 maintenance. Preserve release continuity and label each lab's evidence separately from unrelated feature work.

For later handout conflicts, including final video duration or points already flagged in the project plan, seek clarification and retain the decision; do not encode an unverified limit here.

## 9. Communication and completion

Explain the outcome, changed files, checks actually run and remaining limitations plainly. Distinguish mandatory course requirements from team choices. If missing information blocks a specific step, explain why and continue work that does not depend on it.

Before declaring a feature or release complete, verify its agreed DoD: required behavior implemented, meaningful planned verification executed, review/integration complete, documents/setup current and incomplete work disclosed. A document's existence or an AI assertion is not completion evidence.
