-- ============================================================
-- YHCIC admin panel — schema, part 5: publication tracking.
-- "Published in the database" and "live on the public site" are two
-- different facts that can briefly disagree (a build fails, Supabase
-- is unavailable, the deploy hook errors). This table is how the
-- panel tells the truth about which one is currently the case,
-- instead of implying success the moment the database write commits.
-- ============================================================

create type publication_state as enum ('publishing', 'live', 'failed');

create table publications (
  id            uuid primary key default gen_random_uuid(),
  requested_by  uuid not null references admin_profiles(id),
  requested_at  timestamptz not null default now(),
  state         publication_state not null default 'publishing',
  deployment_id text,             -- Vercel deployment id, if available
  completed_at  timestamptz,
  error_summary text              -- safe, human-readable only — never a raw build log
);

create index publications_latest_idx on publications (requested_at desc);
