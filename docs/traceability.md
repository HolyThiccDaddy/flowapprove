# Requirements traceability (planning baseline)

All rows below are **planned**. “Verification” means planned method, not an executed result. Actual test file, command, result and commit remain blank until real implementation and test execution.

| Requirement | Feature / responsibility | Sprint | Planned acceptance / verification | Current status |
| --- | --- | --- | --- | --- |
| FR-01 | F-01 | 1 | AC-01–03; TEST-01–03: valid/invalid login, current identity, logout and anonymous protected request. | Planned |
| FR-02 | F-02 | 1 | AC-04–05; TEST-04–05: submit valid request, reload persisted detail; reject invalid fields without row. | Planned |
| FR-03 | F-03 | 1 | AC-07–08; TEST-07–08: assigned approve/reject with persisted state/history. | Planned |
| FR-04 | F-02, F-03 | 1 | AC-06, AC-09; TEST-06, TEST-09: own/assigned access succeeds; cross-owner/unassigned/wrong-role access denied. | Planned |
| FR-05 | F-04 | 2 | Define AC/STS in F-04 contract before coding; revise/resubmit and history. | Planned |
| FR-06 | F-05 | 2 | Define AC/STS before coding; queue/filter results remain role-scoped. | Planned |
| FR-07 | F-06 | 3 | Define AC/STS before coding; summary excludes out-of-scope requests. | Planned |
| FR-08 | F-07 if adopted | 3 | Define stages, ordering, rejection and reassignment AC/STS only after D-05 approval. | Conditional / open |
| BR-01 | F-03 | 1 | AC-10; TEST-10: reject repeat, terminal or invalid transition; no extra decision/history. | Planned |
| BR-02 | F-03 | 1 | AC-09; TEST-09: self-approval denied even with controlled fixture where requester ID equals acting Reviewer ID. | Planned |
| BR-03 | F-02, F-03, F-04, F-05 | 1–2 | TEST-06/09 and feature-specific access checks. Backend enforces owner, role and assignment. | Planned |
| BR-04 | F-03 | 1 | TEST-07/08/10: state and history commit atomically with actor/action/reason/time. | Proposed implementation |
| BR-05 | F-04 | 2 | Contract must define editable states and revision persistence before implementation. | Open policy |
| BR-06 | F-02 | 1 | TEST-05 validates non-empty required fields and positive decimal amount; currency/max need D-04. | Proposed / limits open |
| NFR-01 | F-01–F-05 | 1–2 | API tests for 401 anonymous and denied cross-owner/role/assignment with safe response. | Planned |
| NFR-02 | F-02–F-04 | 1–2 | API/database restart/reload persistence check. | Planned |
| NFR-03 | SYS-01 | 1–3 | Manual/UI checks at 375, 768, 1280 CSS px; record actual outcome. | Planned |
| NFR-04 | SYS-02 | 3 | Measure p95 on named machine and fixture only if team approves target. | Proposed / open |
| NFR-05 | F-01 | 1 | Inspect hash storage and scan repository for secrets; no real secrets in output. | Planned |

No requirement is verified or passed in this planning-only baseline. If scope changes, preserve the original ID and record approved change and reason.
