# Workflow and Approval System

This repository is the EN-037 DoubleP team's **Workflow and Approval System** project for CPE 334, Theme 5. The GitHub repository slug is `flowapprove`.

Members: Thira Rungruangkaset / HolyThiccDaddy (67070503419) and Ashira Sansoda / osizk (67070503445). The team registration Sheet confirms EN-037, DoubleP and Theme 5.

## Delivery status

Issue #1 planning documents are a review candidate; pair approval of the detailed scope/contracts remains pending. The Issue #2 implementation follows the user's direction to proceed with the selected candidate and does not claim teammate sign-off. The `feature/authentication` branch contains the Issue #3 candidate. On commit `3574c82`, unit suites and production builds passed; real API/database integration and browser execution remain pending a local database setup and teammate review. Request submission and approval remain subsequent issues.

Course checkpoints: Deliverable 1 — 8 Nov 2026 at 23:59; Lab 5 — 15 Nov; Lab 6 — 22 Nov; Deliverable 2/Lab 7 — 29 Nov; Final Project Delivery — 13 Dec. The Final handout has conflicting video limits (10 minutes in section 2 and 4 minutes in section 3.5); the plan records this as an instructor/TA question. Target 4 minutes until clarified.

## Prerequisites

- Node.js 24 LTS and npm 11 (the repository declares Node `>=24.11 <25`).
- PostgreSQL 16 or newer. PostgreSQL must be listening on the local machine for the documented development and test setup.
- A Chromium browser installed for Playwright E2E.

## Local setup

From the repository root:

1. Install locked dependencies: `npm ci`.
2. Create three empty local PostgreSQL databases owned by a least-privileged application role: `flowapprove_dev`, `flowapprove_test`, and `flowapprove_shadow`. Do not use a production/shared database. The role must be able to create/alter schema objects in these databases; it does not need `CREATEDB` because the shadow database is explicit.
3. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `SHADOW_DATABASE_URL` to those local databases, and set `UI_ORIGIN` to the exact browser origin. The API sends credentialed CORS headers only for this origin. Keep credentials local; never commit `.env`.
4. Apply committed migrations: `npm run db:migrate --workspace server`.
5. For local demo data only, set the four `SEED_*_PASSWORD` variables in `server/.env` to unique synthetic passwords (12–128 characters) before running `npm run db:seed --workspace server`. Seeding is limited by code to a local PostgreSQL host and a `flowapprove_*_dev` or `flowapprove_*_test` database. It creates Requester A/B and Reviewer R/S, maps A→R and B→S, hashes new passwords with Argon2id, and never overwrites existing passwords, role, active state, or non-null reviewer mapping.
6. Start API and UI: `npm run dev`.
7. Open `http://127.0.0.1:5173/login`. The API is at `http://127.0.0.1:4000`; `/api/health` is liveness and `/api/health/database` checks a real PostgreSQL query.

A minimal local role example (run using a PostgreSQL administrator account only during initial local setup):

```sql
CREATE ROLE flowapprove_app LOGIN;
CREATE DATABASE flowapprove_dev OWNER flowapprove_app;
CREATE DATABASE flowapprove_test OWNER flowapprove_app;
CREATE DATABASE flowapprove_shadow OWNER flowapprove_app;
```

Use local authentication configured for your PostgreSQL installation. Do not put a real password into the example file or commit it. If your local PostgreSQL requires a password, enter it only in your ignored `server/.env` file.

## Tests and build

The test runner requires `TEST_DATABASE_URL` explicitly. It rejects non-PostgreSQL URLs, non-local hosts and database names that do not end with `_test`, does not fall back to `DATABASE_URL`, then applies only committed migrations to the isolated test database before running server unit and DB/API integration tests. The shadow DB guard requires a distinct local `flowapprove_*_shadow` database to prevent Prisma from dropping objects in the application database.

1. Copy `server/.env.test.example` to your local shell environment or load it with your preferred secret-safe environment manager. Set `TEST_DATABASE_URL` to the dedicated empty `flowapprove_test` database. Never point it at `flowapprove_dev` or any shared/production database.
2. Run `npm test` from the repository root. It runs the guarded server migrate/test flow and client unit tests. Tests add only their owned fixtures and clean them up; they do not reset or truncate the test database.
3. Run `npm run test:e2e` for Playwright smoke coverage.
4. Run `npm run build` for TypeScript and production builds.
5. `npm run test:unit` runs only the server unit and client unit suites; it does not connect to PostgreSQL.

The seed creates only missing synthetic users, so initial passwords are required only when those identities do not already exist. Preserve `server/.env` and its synthetic seed values between reruns if repeatable demo logins are needed. Sign in with `requester.a@example.test`, `requester.b@example.test`, `reviewer.r@example.test` or `reviewer.s@example.test` and the corresponding locally configured seed password. Browser authentication E2E uses `SEED_REQUESTER_A_PASSWORD`; if it is unset, that one credential-dependent browser test is reported as skipped. Use fake data only; no real member credentials are expected in this project.

Prisma Client is generated automatically before the server starts, before the seed runs, before server integration-test migrations, and during the build. A fresh clone does not need a build step before seeding or starting the application. The authentication feature uses Argon2id seed hashes, an opaque HTTP-only cookie with an absolute 8-hour lifetime, server-stored token hashes, and session-bound CSRF on logout. Public-login rate limiting remains a release prerequisite from the SDS and must be implemented and verified before deployment.

## Project documents

| File | Purpose / status |
| --- | --- |
| [Project plan](docs/project-plan.md) | Source comparison, baseline plan, three sprints, A–F coverage and open decisions. |
| [SRS](docs/srs.md) | Draft problem, scope, actors, requirements, rules and NFRs. |
| [Feature inventory](docs/features.md) | Draft features, dependencies and sprint allocation. |
| [Traceability](docs/traceability.md) | Requirement-to-feature-to-sprint-to-verification mapping; executed evidence is identified separately from planned checks. |
| [System SDS](docs/system-sds.md) | Architecture, data, API, permissions, session and delivery design. |
| [Sprint 1 contracts](docs/sprints/sprint-1/contracts.md) | F-01–F-03 designs, AC and STS; pair review remains pending. |

## Issues and Git workflow

Sprint 1 Issues: [#1 baseline/contracts](https://github.com/HolyThiccDaddy/flowapprove/issues/1), [#2 foundation](https://github.com/HolyThiccDaddy/flowapprove/issues/2), [#3 identity](https://github.com/HolyThiccDaddy/flowapprove/issues/3), [#4 requests](https://github.com/HolyThiccDaddy/flowapprove/issues/4), [#5 decisions/history](https://github.com/HolyThiccDaddy/flowapprove/issues/5), [#6 integration/release](https://github.com/HolyThiccDaddy/flowapprove/issues/6). Work branches from `sprint-1-staging`; feature PRs target that branch after teammate review. Do not commit to `main` or claim an Issue done before its PR is formally approved and merged.

## Source material and open decisions

The project plan derives from the Group Work Specification and Project Deliverables 1/2/Final handouts. The team's registration Sheet was read only. The selected planning baseline is described in [Issue #1 review candidate](docs/sprints/sprint-1/contracts.md); teammates must review it before the dependent feature implementation is treated as agreed. The two Final handouts conflict on video length; see [project plan](docs/project-plan.md) for the exact question.
