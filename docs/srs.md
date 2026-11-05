# Software Requirements Specification (draft)

**Project:** CPE 334 EN-037 DoubleP · **Theme:** 5, Workflow and Approval System  
**Product name:** Workflow and Approval System (owner-selected; pair review pending)  
**Status:** Issue #1 review candidate, 5 Nov 2026. The user selected the purchase-request proposal for teammate review; pair approval is pending. No implementation or verification is claimed.
**Team:** Thira Rungruangkaset (GitHub: HolyThiccDaddy, student ID 67070503419) and Ashira Sansoda (GitHub: osizk, student ID 67070503445).

## 1. Problem and context

An organization needs controlled review of funding, purchase, travel, reimbursement or similar requests. Email and spreadsheets make it difficult to see who owns a request, who may decide it, what decision was made, and how its state changed. The proposed context is small departmental purchase requests. That context is a proposal to focus the stakeholder brief and requires team agreement.

## 2. Actors

| Actor | Responsibility | Boundary |
| --- | --- | --- |
| Requester | Submit requests and see their own request state and history. | Cannot review or read another Requester's records. |
| Reviewer | Review requests assigned to them and record a decision. | Cannot review unassigned requests or approve their own request. |
| Course grader / TA | Inspect the submitted release and its evidence. | No application role or production account is implied. |

Sprint 1 uses seeded accounts. Self-registration, recovery, email verification and account administration are excluded.

## 3. Scope

The selected review proposal covers equipment purchase requests: login/logout/current identity, creation and persisted detail, assigned Reviewer list, approve/reject and history, then return/resubmit, filtering and decision summaries. One approval stage is sufficient for the baseline; an extra stage requires explicit scope change (FR-08).

Out of scope in this baseline proposal: real procurement/payment, inventory, external email or messaging, file attachments, public self-registration, SSO, advanced administration, and GCP deployment before Lab 5. Synthetic data only.

## 4. Requirements

“Course-required” marks direct Theme 5 / Deliverable 1 expectations. Proposed fields, thresholds and later-sprint allocation remain subject to team review.

### Functional requirements

| ID | Requirement | Status / planned sprint |
| --- | --- | --- |
| FR-01 | **Course-required:** Users log in, retrieve current server-side identity and log out; Sprint 1 has at least Requester and Reviewer roles. | S1 |
| FR-02 | **Course-required:** A Requester submits a request and can retrieve its persisted status/detail. | S1 |
| FR-03 | **Course-required:** The assigned Reviewer approves or rejects a submitted request; the decision is persisted and visible in its history. | S1 |
| FR-04 | **Course-required:** Requesters read only their own requests; Reviewers act only on assigned/authorized requests. | S1 |
| FR-05 | **Theme later-work proposal:** Assigned Reviewer returns a request with a reason; owner revises and resubmits it, preserving history. | S2 |
| FR-06 | **Theme later-work proposal:** Status/date filters for authorized requests. A minimal assigned Reviewer list is already included in FR-04 in S1. | S2 |
| FR-07 | **Theme reporting proposal:** Reviewer views decision summaries only within their authorized scope. | S3 |
| FR-08 | **Deferred outside the one-stage baseline:** Multi-stage approval requires explicit scope change, contracts, sprint allocation and tests if adopted. | Not committed |

### Business rules

| ID | Rule | Status |
| --- | --- | --- |
| BR-01 | **Course-required:** Reject invalid transitions; only a request awaiting review may receive one approve/reject terminal decision. | S1 |
| BR-02 | **Course-required:** The requester may not approve their own request. Compare authenticated requester and acting Reviewer IDs on the server. | S1 |
| BR-03 | **Course-required:** Requesters access only their own requests; Reviewers read/decide assigned requests only. Requester operations cannot invoke review actions. Assignment follows controlled policy D-01. | S1 |
| BR-04 | **Proposed implementation:** Persist state change and decision history atomically; include request, actor, action, reason and server timestamp. | S1 |
| BR-05 | **Review proposal:** Submitted fields cannot be edited/deleted in S1, including terminal requests. S2 permits owner editing only after return, with preserved revisions/history. | S1 lock; S2 return/revision |
| BR-06 | **Review proposal:** Trim title/purpose; title 5–120 characters, purpose 10–2000. Amount is a plain decimal string, at most two fractional digits, THB 0.01–1,000,000.00 inclusive. Currency must be THB. Reject exponent notation, non-string amounts and excess precision; store exact decimal. | S1; proposed limits |

### Non-functional requirements

| ID | Requirement / target | Verification | Sprint |
| --- | --- | --- | --- |
| NFR-01 | Protected endpoints reject unauthenticated calls with 401 and no private payload; unauthorized role/owner/assignment is consistently denied with 403 or safe 404. | API tests for anonymous, wrong role, owner and assignment cases. | S1 |
| NFR-02 | Request status and decision history survive API restart. | Persist data, stop/restart API against the same isolated database, log in again and retrieve matching request/decision/history. Browser reload or new HTTP context alone is insufficient. | S1 |
| NFR-03 | At 375, 768 and 1280 CSS px, critical screens have no horizontal overflow or overlapping controls. | Manual responsive inspection and selected UI checks; record actual browser/viewport. | S1–S3 |
| NFR-04 | Proposed target: for a documented 100-request local fixture, list/detail p95 under 1 second on a named test machine. | Repeatable measurement with command, environment and commit. Confirm target before S3. | S3; open |
| NFR-05 | Passwords are never stored in plaintext; real credentials/secrets are never committed. | Inspect password hashing path/seed and scan repository before release. | S1 |

## 5. Decision register — teammate review pending

On 5 Nov the user selected equipment purchase requests, React/Node TypeScript/PostgreSQL, one stage, seeded assignment, submitted-field locking, reject-reason required/approve-reason optional, and THB 0.01–1,000,000.00 for teammate review. Other details below are agent proposals. None constitute pair approval.

| ID | Question | Current proposal | Required resolution |
| --- | --- | --- | --- |
| D-01 | Assignment | One seeded active Reviewer mapping per Requester; server copies it on submit. No client assignment or reassignment UI. Missing/inactive/wrong-role/self mapping: 422 NO_ELIGIBLE_REVIEWER, no writes. | Pair review pending; precise mapping/error is agent proposal. |
| D-02 | Editing/states | Submit directly to PENDING_REVIEW, no draft/edit/delete endpoint in S1. APPROVED/REJECTED are terminal. S2 return/resubmit preserves snapshots before editing. | Pair review pending. |
| D-03 | Reasons | Reject/return: trimmed 1–1000 characters required. Approve: optional, max 1000, empty becomes null. Actor/time server-derived. | Pair review pending; text limits agent-proposed. |
| D-04 | Fields/currency | BR-06 defines transport/limits; THB only; no amount-dependent approval thresholds. | Pair review pending; text limits/transport agent-proposed. |
| D-05 | Stages | One stage throughout baseline; FR-08/F-07 explicitly deferred, not silently removed. | Pair review pending. |
| D-06 | Stack | React + TypeScript, Node.js + TypeScript, PostgreSQL; SDS proposes exact tooling/security/test design. Issue #2 validates compatibility and records actual commands. | Pair review pending. |

The owner selected Workflow and Approval System as the project name; the course prescribes Theme 5 rather than a repository name. Pair sign-off on the scope and detailed decisions remains pending.


## 6. Change control

Use stable IDs. Record approved scope changes with date, reason and impact on features, sprints, contracts and tests. Do not silently remove a requirement or mark planned verification as passed.

Issue #1 reconciliation, 5 Nov: retain SRS meanings (BR-01 transition, BR-02 self-approval, BR-03 access/assignment, BR-04 atomic history, BR-05 editing, BR-06 validation) and D-01–06 above. The earlier project-plan BR-01/03/06 and D-02/03/04/06 had conflicting meanings; align that duplicate to SRS without renumbering SRS. Remove nonexistent D-07 from SDS. Record FR-08 as deferred. Pair review and implementation are pending.
