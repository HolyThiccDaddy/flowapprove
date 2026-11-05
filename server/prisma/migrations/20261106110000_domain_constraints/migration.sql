-- Keep business invariants enforceable even if a future code path bypasses API validation.
ALTER TABLE "users"
  ADD CONSTRAINT "users_email_normalized_check"
  CHECK ("email" = lower("email") AND "email" = btrim("email"));

ALTER TABLE "users"
  ADD CONSTRAINT "users_default_reviewer_not_self_check"
  CHECK ("default_reviewer_id" IS NULL OR "default_reviewer_id" <> "id");

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_expiry_after_creation_check"
  CHECK ("expires_at" > "created_at");

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_amount_range_check"
  CHECK ("estimated_amount" >= 0.01 AND "estimated_amount" <= 1000000.00);

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_thb_only_check"
  CHECK ("currency" = 'THB');

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_requester_not_reviewer_check"
  CHECK ("requester_id" <> "assigned_reviewer_id");

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_version_nonnegative_check"
  CHECK ("version" >= 0);

ALTER TABLE "decisions"
  ADD CONSTRAINT "decisions_rejection_reason_check"
  CHECK ("action" <> 'REJECT' OR ("reason" IS NOT NULL AND btrim("reason") <> ''));

ALTER TABLE "request_events"
  ADD CONSTRAINT "request_events_transition_consistency_check"
  CHECK (
    ("event_type" = 'SUBMITTED' AND "from_status" IS NULL AND "to_status" = 'PENDING_REVIEW' AND "reason" IS NULL)
    OR ("event_type" = 'APPROVED' AND "from_status" IS NOT NULL AND "from_status" = 'PENDING_REVIEW' AND "to_status" = 'APPROVED')
    OR ("event_type" = 'REJECTED' AND "from_status" IS NOT NULL AND "from_status" = 'PENDING_REVIEW' AND "to_status" = 'REJECTED' AND "reason" IS NOT NULL AND btrim("reason") <> '')
  );
