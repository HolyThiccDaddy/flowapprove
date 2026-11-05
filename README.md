# Workflow and Approval System

Planning repository for **CPE 334, EN-037 DoubleP**, Theme 5: Workflow and Approval System. The owner selected **Workflow and Approval System** as the project name. The GitHub repository slug remains `flowapprove` until it is renamed; the course does not prescribe a repository name.

Members: Thira Rungruangkaset / HolyThiccDaddy (67070503419) and Ashira Sansoda / osizk (67070503445). The team registration Sheet confirms EN-037, DoubleP and Theme 5. This repository contains planning documents only. The application, tests, release and submission evidence have not been produced.

## Documents

| File | Purpose / status |
| --- | --- |
| [Project plan](docs/project-plan.md) | Source comparison, baseline plan, three sprints, A–F coverage and open decisions. |
| [SRS](docs/srs.md) | Draft problem, scope, actors, requirements, rules and NFRs. |
| [Feature inventory](docs/features.md) | Draft features, dependencies and sprint allocation. |
| [Traceability](docs/traceability.md) | Requirement-to-feature-to-sprint-to-planned-verification mapping. All verification is planned, not executed. |
| [System SDS](docs/system-sds.md) | Proposed architecture, data, API, permissions, session and delivery design. |
| [Sprint 1 contracts](docs/sprints/sprint-1/contracts.md) | Draft F-01–F-03 designs, AC and STS. Requires pair review and decision closure before implementation. |

Course requirements are distinguished from team proposals and open decisions. These documents are drafts for review; their presence does not mean the team approved all design choices or that anything is implemented.

## Course checkpoints

- **Deliverable 1:** 8 Nov 2026 at 23:59 — engineering baseline plus working Sprint 1, with one self-contained PDF submitted in LEB2.
- **Lab 5:** 15 Nov — Docker, CI/CD and GCP deployment.
- **Lab 6:** 22 Nov — cross-team UAT.
- **Deliverable 2 and Lab 7:** 29 Nov — Sprint 2 completion, Sprint 3 progress and maintenance.
- **Final Project Delivery:** 13 Dec — completed, verified release, report and video.

The Final handout is internally inconsistent on the video limit (10 minutes in section 2, 4 minutes in section 3.5), and its points differ from the master specification. See the open question in the plan; use a four-minute target until the instructor/TA clarifies it.

## Issue #1 review candidate

On 5 Nov 2026 the user selected a review proposal: equipment purchase requests, React/Node TypeScript/PostgreSQL, one approval stage, seeded server-side Reviewer assignment, immutable submitted requests, rejection reason required/approval reason optional, and THB 0.01–1,000,000.00 with two-decimal precision. Detailed validation, API, data, session/security and STS proposals are in the SRS, SDS and Sprint 1 contracts. **Teammate review and pair approval remain pending.** No application, passing tests or release is claimed.

The SRS is canonical for requirement IDs and D-01–06. Additional approval stages (FR-08/F-07) are explicitly deferred outside the selected baseline. The project name is Workflow and Approval System; pair confirmation of the scope and detailed contracts remains pending.

Sprint 1 backlog: [#1 baseline/contracts](https://github.com/HolyThiccDaddy/flowapprove/issues/1), [#2 foundation](https://github.com/HolyThiccDaddy/flowapprove/issues/2), [#3 identity](https://github.com/HolyThiccDaddy/flowapprove/issues/3), [#4 requests](https://github.com/HolyThiccDaddy/flowapprove/issues/4), [#5 decisions/history](https://github.com/HolyThiccDaddy/flowapprove/issues/5), [#6 integration/release](https://github.com/HolyThiccDaddy/flowapprove/issues/6). The user requested no Submission PDF Issue; the PDF is still required.

Issue #1 work is on `docs/sprint-1-baseline`, targeting `sprint-1-staging` after genuine teammate review. **Do not commit on main.** No release promotion is part of this documentation task. Both students must understand and review the requirements/designs before affected implementation.

When implementation starts, add exact dependencies, environment-variable examples, database migration/seed, local run, build and test commands. Keep secrets out of Git.

## Source material

Derived from the four course handouts supplied locally: Group Work Specification, Project Deliverables 1 and 2, and Final Project Delivery. The [team registration Sheet](https://docs.google.com/spreadsheets/d/1o9Nov4AiqYeRHTswY_TaeWlWNzjIVlM77tRnmniKRhE/edit?gid=2080208721#gid=2080208721) was read only.
