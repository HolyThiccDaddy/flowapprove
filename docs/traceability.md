# Requirements traceability — Issue #1 review candidate

All verification is **planned, not executed**. Canonical IDs/decisions: [SRS](srs.md). Exact Sprint 1 AC/STS, planned files and shared UI/security checks: [contracts](sprints/sprint-1/contracts.md). No application/test files or results exist yet.

| Requirement | Feature/responsibility | Sprint | Planned verification | Status |
| --- | --- | --- | --- | --- |
| FR-01 | F-01 | 1 | AC-01–03 / TEST-01–03; both role logins, safe identity, logout, expiry, anonymous denial | Planned; pair review pending |
| FR-02 | F-02 | 1 | AC-04–05 / TEST-04–05; submission, validation, actual DB/restart retrieval | Planned |
| FR-03 | F-03 | 1 | AC-07–08 / TEST-07–08; assigned approve/reject with durable history | Planned |
| FR-04 | F-02/F-03 | 1 | AC-06/09 / TEST-06/09; scoped lists/detail/history and role/assignment denials | Planned |
| FR-05 | F-04 | 2 | Versioned return/revise/resubmit AC/STS before coding; previous submissions retained | Planned |
| FR-06 | F-05 | 2 | Define status/date filter AC/STS before coding; scoped pagination remains enforced | Planned |
| FR-07 | F-06 | 3 | Define summary calculations/authorized scope and AC/STS before coding | Planned |
| FR-08 | F-07 deferred | Not committed | Explicit D-05 scope change required to adopt extra stages | Outside selected baseline; ID retained |
| BR-01 | F-03; later F-04 | 1–2 | AC-10 / TEST-10; valid/invalid, stale, repeated and concurrent transitions | Planned |
| BR-02 | F-03 | 1 | AC-09 / TEST-09; no-self unit guard plus safe self-assignment rejection | Planned |
| BR-03 | F-02/F-03; later F-04–06 | 1–3 | AC-05/06/09 / TEST-05/06/09; mapping, role, ownership/assignment, list/detail/history isolation | Planned |
| BR-04 | F-02/F-03; later F-04 | 1–2 | AC-04/07/08/10 / TEST-04/07/08/10; transaction/rollback, actor/time/history consistency | Planned |
| BR-05 | F-02 then F-04 | 1–2 | AC-06 / TEST-06: no S1 edit/delete; S2 feature contract adds returned-only editing/revision checks | Selected proposal; review pending |
| BR-06 | F-02 | 1 | AC-05 / TEST-05; text, decimal/THB and bound checks with no partial writes | Selected proposal; review pending |
| NFR-01 | F-01–03; later F-04–06 | 1–3 | TEST-01–03/06/09; session/role/ownership/assignment and safe errors; later feature checks | Planned |
| NFR-02 | F-02/F-03; later F-04 | 1–2 | TEST-04/07/08/10; restart/retrieve, persistent history and atomic writes | Planned |
| NFR-03 | SYS-01 with F-01–06 | 1–3 | UI-CHECK-01 plus selected authentication/submission/approval E2E; responsive/keyboard/states; regression | Planned |
| NFR-04 | SYS-02 | 3 | Agree p95 target/fixture/method before measurement; actual command/environment/version recorded then | Proposed target; review pending |
| NFR-05 | F-01 and release responsibility | 1 | TEST-01 and SEC-CHECK-01; actual password-hash/storage/config and secret review | Planned |

## Sprint 1 AC-to-test execution register

Planned filenames are design targets, not existing files. Multiple subcases per Test ID are expected; record their actual names/results when implemented. Do not treat this table as passing evidence.

| AC | Test | Planned location(s) | Execution result / command / tested commit |
| --- | --- | --- | --- |
| AC-01 | TEST-01 | server/tests/auth.integration.test.ts; e2e/authentication.spec.ts | Not executed |
| AC-02 | TEST-02 | server/tests/auth.integration.test.ts | Not executed |
| AC-03 | TEST-03 | server/tests/auth.integration.test.ts; e2e/authentication.spec.ts | Not executed |
| AC-04 | TEST-04 | server/tests/requests.integration.test.ts; server/tests/persistence.integration.test.ts; e2e/request-submission.spec.ts | Not executed |
| AC-05 | TEST-05 | server/tests/request-validation.test.ts; server/tests/requests.integration.test.ts | Not executed |
| AC-06 | TEST-06 | server/tests/requests.integration.test.ts | Not executed |
| AC-07 | TEST-07 | server/tests/decisions.integration.test.ts; e2e/approval-flow.spec.ts | Not executed |
| AC-08 | TEST-08 | server/tests/decisions.integration.test.ts | Not executed |
| AC-09 | TEST-09 | server/tests/decision-rules.test.ts; server/tests/decisions.integration.test.ts | Not executed |
| AC-10 | TEST-10 | server/tests/decision-rules.test.ts; server/tests/decisions.integration.test.ts | Not executed |

For UI-CHECK-01/SEC-CHECK-01, also record method, environment/version, actual results and findings when performed. Issue #6 consolidates actual results and selected evidence; it cannot substitute a release claim for unexecuted checks.

Issue #1 gap status: detailed proposals are ready for pair review; agreement, tooling validation, all implementation/execution and reviewed integration remain pending. Future features need contracts before coding. Deferred FR-08 is explicitly excluded, not a silently uncovered requirement.
