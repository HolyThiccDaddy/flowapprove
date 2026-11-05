# Software Requirements Specification (draft)

**Project:** CPE 334 EN-037 DoubleP · **Theme:** 5, Workflow and Approval System  
**Product name:** FlowApprove (team proposal; not course-mandated)  
**Status:** Draft for pair review. No requirement or design decision below is team-approved unless explicitly marked course-required.  
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

The planned product covers login/logout/current identity; request creation and persisted detail; assigned Reviewer queue; approve/reject decisions with reasons and history; later return/resubmit, filtering, decision summaries and a possible additional approval stage.

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
| FR-06 | **Theme later-work proposal:** Users filter the requests they are allowed to see; Reviewers have an assigned work queue. | S2 |
| FR-07 | **Theme reporting proposal:** Reviewer views decision summaries only within their authorized scope. | S3 |
| FR-08 | **Conditional proposal:** Multi-stage approval, if the team adopts and specifies the stages, ordering, assignment and rejection rules. | S3 only if approved |

### Business rules

| ID | Rule | Status |
| --- | --- | --- |
| BR-01 | **Course-required:** Reject invalid transitions; only a request awaiting review may receive one approve/reject terminal decision. | S1 |
| BR-02 | **Course-required:** The requester may not approve their own request. Compare authenticated requester and acting Reviewer IDs on the server. | S1 |
| BR-03 | **Course-required:** Reviewer access and decision authority require assignment/authorization; Requester operations cannot invoke review actions. | S1 |
| BR-04 | **Proposed implementation:** Persist state change and decision history atomically; include request, actor, action, reason and server timestamp. | S1 |
| BR-05 | **Proposed policy:** Lock submitted fields while under review; allow editing only after return, and retain resubmission history. | S2; open decision |
| BR-06 | **Proposed validation:** Title and purpose are non-empty; estimated amount is positive and calculated/stored using decimal precision. Currency and maximum are open decisions. | S1; open limits |

### Non-functional requirements

| ID | Requirement / target | Verification | Sprint |
| --- | --- | --- | --- |
| NFR-01 | Protected endpoints reject unauthenticated calls with 401 and no private payload; unauthorized role/owner/assignment is consistently denied with 403 or safe 404. | API tests for anonymous, wrong role, owner and assignment cases. | S1 |
| NFR-02 | Request status and decision history survive API restart. | Integration test reads committed data using a new request/context after persistence. | S1 |
| NFR-03 | At 375, 768 and 1280 CSS px, critical screens have no horizontal overflow or overlapping controls. | Manual responsive inspection and selected UI checks; record actual browser/viewport. | S1–S3 |
| NFR-04 | Proposed target: for a documented 100-request local fixture, list/detail p95 under 1 second on a named test machine. | Repeatable measurement with command, environment and commit. Confirm target before S3. | S3; open |
| NFR-05 | Passwords are never stored in plaintext; real credentials/secrets are never committed. | Inspect password hashing path/seed and scan repository before release. | S1 |

## 5. Assumptions and open decisions

| ID | Question | Current proposal | Required resolution |
| --- | --- | --- | --- |
| D-01 | How and when is a Reviewer assigned? | Seeded eligible Reviewer mapping; server assigns on submit. | Agree mapping, no-assignee behavior and whether Requester can select from an allowed list. |
| D-02 | Can a request be edited after submission? | Lock while pending; edit only after return. | Agree exact states and revision/history representation before F-02/F-04. |
| D-03 | What reasons are required? | Required on reject and return; optional on approve. | Agree and encode UI/API validation. |
| D-04 | Which currency, decimal scale and amount maximum? | Decimal storage; no limit invented. | Choose synthetic domain rules and boundary tests. |
| D-05 | How many approval stages? | One stage in S1; additional stage is optional. | Decide whether FR-08 belongs in baseline; if yes, define ordering and rejection semantics. |
| D-06 | Which stack? | React + TypeScript, Node + TypeScript, PostgreSQL proposed. | Pair confirms stack before freezing SDS/contracts. |


## 6. Change control

Use stable IDs. Record approved scope changes with date, reason and impact on features, sprints, contracts and tests. Do not silently remove a requirement or mark planned verification as passed.
