# Requirements traceability — Issue #1 review candidate

Feature AC verification remains pending unless the execution register says otherwise. Issue #2 foundation verification is tracked separately below. Canonical IDs/decisions: [SRS](srs.md); exact Sprint 1 AC/STS and shared UI/security checks: [contracts](sprints/sprint-1/contracts.md).

| Requirement | Feature/responsibility | Sprint | Planned verification | Status |
| --- | --- | --- | --- | --- |
| Foundation | Issue #2: schema/migrations, local-safe seed, API/client shell and toolchain | 1 | `server/tests/test-database-url.test.ts`, `server/tests/seed-database-url.test.ts`, `server/tests/shadow-database-url.test.ts`, `server/tests/prisma-client-lifecycle.test.ts`, `server/tests/foundation.integration.test.ts`, `client/tests/app.test.tsx`, `client/e2e/foundation.spec.ts` | Local verification passed; PR #8 targets `sprint-1-staging` and requests `osizk`. PR is open; GitHub check runs are not configured. See Issue #2 execution evidence below. |
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

The paths below remain planned for feature Issues #3–#5. Issue #2 foundation tests are implemented separately and are not evidence that the feature AC listed here have passed. Multiple subcases per Test ID are expected; record actual names/results when implemented. Do not treat planned entries as passing evidence.

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

Issue #1 gap status: detailed proposals are ready for pair review; agreement and feature implementation remain pending. Issue #2 establishes reusable tooling; its actual run results and tested commit are recorded in the Issue #2 PR. All feature-level execution and reviewed integration remain pending. Future features need contracts before coding. Deferred FR-08 is explicitly excluded, not a silently uncovered requirement.


## Issue #2 foundation execution evidence

**Status:** PR #8 is open from `feature/project-foundation` to `sprint-1-staging`; `osizk` was requested as reviewer. The implementation follows the user's direction to proceed with the selected Issue #1 candidate; this evidence does not represent pair approval of the pending design decisions.

- TDD: the database URL guard tests first failed because the resolver module was absent; after implementation the unit suite passed (4 files, 28 tests).
- Initial `npm test`: server 5 files / 31 tests passed; client 1 file / 1 test passed. The runner migrated only `flowapprove_issue2_test`, while `DATABASE_URL` was deliberately set to the separate development database.
- Fresh database path: the isolated test database applied both committed migrations from an empty schema. The migration-managed development database applied the additive domain-constraints migration.
- Safe seed regression: the initial implementation's two seed runs passed against the isolated local development database. Integration coverage verifies reruns preserve an intentionally changed password hash, reviewer mapping and request history.
- Existing baseline E2E: one Chromium smoke test passed on the earlier foundation head; it checked the UI and live API's PostgreSQL health endpoint.
- The test-runner guard rejects missing, malformed, non-PostgreSQL and non-`_test` URLs without falling back to `DATABASE_URL`. Seed guard rejects remote hosts and unapproved database names. Shadow URL guard rejects pointing the migration shadow database at the same physical database.
- Prisma Client generation review follow-up was published at PR commit `7ffbf56ae7123355ff03756afd8cde1c7e3d0550`. In a clean checkout of that source, `npm ci --offline` started and ended without `server/src/generated/prisma/client.ts`; no local `.env` file was present. `npm run db:migrate --workspace server` succeeded with no pending migrations while the generated client remained absent.
- TDD for the P1 fix: the lifecycle test first failed on all three missing-generation checks; after adding the hooks and test-runner generation it passed all 3 checks.
- From that checkout, `npm run db:seed --workspace server` generated Prisma Client before importing the seed and succeeded. `npx prisma db seed` also generated the client through the configured npm lifecycle and succeeded.
- After removing the generated client again, `npm test` generated it before applying test migrations; server passed 6 files / 34 tests and client passed 1 file / 1 test. `npm run build` passed.
- After removing the generated client again, `npm run dev --workspace server` ran `predev`, generated the client, and started the API; both `/api/health` and `/api/health/database` returned `ok`.
- `git diff --check` and the credential-pattern scan passed for the reviewed changes. No password, database credential or generated client was committed.
- Local Windows host workaround: `node:os.userInfo()` fails with `uv_os_get_passwd returned ENOMEM` in this execution environment. Validation used a temporary process-only shim and a temporary copy of the cached Prisma engines; neither workaround was added to the repository.
- GitHub reports zero check runs and zero commit statuses for the P1 follow-up head; the local verification above is recorded separately from those hosted checks.
