-- ============================================================
-- YHCIC admin panel — schema, part 3: membership applications.
-- This table is the single source of truth, written once by the
-- owned intake endpoint. Email notification is a separate, retryable
-- side effect that can never delete or corrupt the stored application —
-- see notification_* columns.
-- ============================================================

create type application_status as enum ('pending', 'accepted', 'rejected');
create type notification_status as enum ('pending', 'sent', 'failed');

create table applications (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  email                     text not null,
  grad_year                 text not null,
  major                     text not null,
  referral                  text,
  experience                text,
  phone                     text,
  status                    application_status not null default 'pending',
  status_changed_by         uuid references admin_profiles(id),
  status_changed_at         timestamptz,
  notification_status       notification_status not null default 'pending',
  notification_attempts     integer not null default 0,
  last_notification_attempt_at timestamptz,
  notification_error_code   text,
  submitted_at              timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index applications_status_idx ON applications (status, submitted_at desc);
create index applications_notification_idx ON applications (notification_status)
  where notification_status <> 'sent';

-- lightweight status-change trail — not a full audit log (see audit_events),
-- just enough to answer "who changed this application and when"
create table application_status_history (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  previous_status application_status,
  new_status     application_status not null,
  changed_by     uuid not null references admin_profiles(id),
  changed_at     timestamptz not null default now()
);
