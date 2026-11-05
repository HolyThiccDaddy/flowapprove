# Workflow and Approval System project plan — Issue #1 review candidate

**Date:** 5 Nov 2026. **Team:** CPE 334 EN-037 DoubleP; Thira Rungruangkaset / HolyThiccDaddy (67070503419), Ashira Sansoda / osizk (67070503445). **Theme:** 5, Workflow and Approval System.

Planning only: no application or released increment exists. The owner selected Workflow and Approval System as the project name and the purchase-request proposal for teammate review; pair approval of scope and detailed contracts is pending. The repository slug is still `flowapprove` until renamed.

## 1. Sources and precedence

- Group Work Specification, sections 2, 5–8 and Theme 5, p. 6: product/engineering baseline.
- Project Deliverable 1, sections 2–4: exact 8 Nov rubric and self-contained PDF. Its detailed instructions govern this assessment over the master's generic evidence-index wording.
- Deliverable 2 and Final Project Delivery: consult detailed handouts before those checkpoints; do not resolve the final-video discrepancy by assumption.
- Team details are inherited from repository baseline; the registration Sheet was not re-verified in Issue #1.
- Source PDFs are local references, not files to edit. The old D:/Downloads source path is not assumed to apply here.

## 2. Canonical baseline

Use [SRS](srs.md) for FR/BR/NFR and D-01–06 meanings, [features](features.md) for allocation, [traceability](traceability.md) for coverage, [SDS](system-sds.md) for design and [contracts](sprints/sprint-1/contracts.md) for Sprint 1 behavior/AC/STS. Avoid a duplicate conflicting requirements table here.

Course-required: real identity, ownership/assignment authorization, request submission/retrieval, assigned approve/reject with history, invalid-transition rejection and no self-approval. Selected review proposal: equipment purchase requests; React/Node TypeScript/PostgreSQL; one stage; seeded server assignment; immutable submitted fields; reject reason required/approve reason optional; THB 0.01–1,000,000.00. Detailed text limits, endpoints, security/test design are agent proposals also requiring review.

FR-08/F-07 additional stages are outside the selected baseline; retain deferred IDs and require explicit scope change to adopt them. Name confirmation, actual pair sign-off and implementation remain pending.

## 3. Three-sprint plan

| Sprint | Goal/features | Dependencies | Completion outcome |
| --- | --- | --- | --- |
| 1 | F-01 sessions, F-02 submit/owned and assigned retrieval, F-03 decisions/history, SYS-01 UI foundation | D-01–06 and contract review; schema/seed/test isolation | Local UI→API→DB increment, reviewed accepted main release and Deliverable 1 PDF by 8 Nov 2026, 23:59 |
| 2 | F-04 return/revise/resubmit with preserved versions; F-05 status/date filters; UI regression | S1 release; D-02/03 expanded contracts and revision schema before coding | Core expansion complete, integrated deployed candidate by 29 Nov, 23:59 |
| 3 | F-06 authorized summaries; SYS-02 agreed performance measurement; UI/access/security regression and defect correction | S2, UAT findings, defined summaries and documented fixture | Contracts and genuine working progress/remaining-work list by 29 Nov; complete accepted product by 13 Dec, 23:59 |

No second approval stage is assumed. Lab 5 due 15 Nov, Lab 6 22 Nov, Lab 7 29 Nov, all 23:59. Plan major development before exams, 1–11 Dec. Labs continue on the same application with identifiable assessment evidence.

## 4. Sprint 1 execution

| Issue | Work | Work branch | Depends on |
| --- | --- | --- | --- |
| #1 | Baseline and contracts | docs/sprint-1-baseline | Pair decisions/review |
| #2 | App/database/test foundation | feature/project-foundation | #1 readiness |
| #3 | F-01 identity | feature/authentication | #1, #2 |
| #4 | F-02 requests | feature/request-submission | #1, #2, #3 |
| #5 | F-03 decisions/history | feature/review-history | #1, #3, #4 |
| #6 | Integration/release | chore/sprint-1-release-verification if needed | #1–5 integrated |

Work branches start from latest sprint-1-staging; reviewed PRs return to staging; accepted releases go through a reviewed staging→main PR. **Current user instruction: no commits on main.** Issue #1 stays on docs/sprint-1-baseline; no main promotion is part of this task.

The user does not want a Submission PDF Issue; PDF preparation is still mandatory. Record actual board status, authors and reviewers; do not infer agreement or close Issues prematurely. Both members participate in design, code, tests and review; specific leads remain to be agreed.

## 5. Deliverable 1 coverage

| Part | Points | Include directly in PDF |
| --- | --- | --- |
| A | 10 | Complete SRS: actors/context, scope/exclusions, FR/BR/NFR, assumptions/decisions |
| B | 10 | Complete inventory/traceability; coverage gaps and approved changes |
| C | 15 | Complete SDS: architecture/data/UI/API/access/auth/config/deployment |
| D | 5 | Three-sprint goals, feature allocation, dependencies and outcomes |
| E | 20 | All Sprint 1 feature designs, applicable layer specs, AC, STS and DoD |
| F | 20 | Real demonstrations, test/build results, review/history, contributions and limitations |

Submit one self-contained PDF on LEB2: names/IDs, context/theme, repository, immutable release, numbered contents and A–F navigation with page ranges/IDs. Embed complete A–E; links alone are insufficient. F shows persisted normal journey/retrieval, rule rejection, login/logout and forbidden access with Feature/AC, role, preconditions, steps and expected/actual captions tied to a version.

Retain actual test files/names, commands, counts and tested commit; every Sprint 1 AC maps to results. Include domain-rule/access test excerpts with results, genuine red/green and contract-before-code history, two completed Issue/PR/review/integration chains, final board state, release, actual contributions, brief AI use and known failed/skipped/incomplete work. Keep secrets out and provide safe seed/private test access plus setup summary.

README/setup and execution evidence are completed when implementation occurs. Docker/CI/CD completion, cloud URL and separate video are not required for Deliverable 1. Verify the submitted release and inspect every PDF page before submission.

## 6. History and pending review

5 Nov 2026, Issue #1: user selected the baseline proposal for teammate review; reconcile IDs and elaborate contracts without claiming pair approval or execution. SRS section 6 records the old conflicting BR/D meanings.

Pair review must confirm/revise D-01–06, detailed contracts, working name and tooling/test proposals. Record reviewer/date/findings/resolutions and accepted revision before affected implementation. Issue #1 remains open until its review/integration DoD is met.

Inherited final-video question: master and Final section 2 say 10 minutes; Final section 3.5 reportedly says 4 minutes and points differ. Ask instructor/TA before final submission; no rule is declared resolved here.
