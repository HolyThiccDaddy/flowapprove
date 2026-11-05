# FlowApprove

Planning repository for **CPE 334, EN-037 DoubleP**, Theme 5: Workflow and Approval System. FlowApprove is a proposed product/repository name; the course does not prescribe it.

Members: HolyThiccDaddy (67070503419) and osizk (67070503445). The team registration Sheet confirms EN-037, DoubleP and Theme 5. This repository contains planning documents only. The application, tests, release and submission evidence have not been produced.

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

## Decisions before implementation

The prohibition on self-approval is required by Theme 5; the team must agree how to enforce and test it. The pair still needs to agree on reviewer assignment, editing after submission, decision reasons, amount/currency limits, stack and whether to include a second approval stage. Freeze the affected contracts before coding.

Both students should review and understand the requirements and designs. Then create bounded Issues and work through reviewed feature branches and sprint staging as required by the course.

When implementation starts, add exact dependencies, environment-variable examples, database migration/seed, local run, build and test commands. Keep secrets out of Git.

## Source material

Derived from the four course handouts supplied locally: Group Work Specification, Project Deliverables 1 and 2, and Final Project Delivery. The [team registration Sheet](https://docs.google.com/spreadsheets/d/1o9Nov4AiqYeRHTswY_TaeWlWNzjIVlM77tRnmniKRhE/edit?gid=2080208721#gid=2080208721) was read only.
