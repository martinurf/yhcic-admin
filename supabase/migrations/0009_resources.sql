-- ============================================================
-- Sources & Research — private files officers upload for the club
-- (readings, data, drafts). Never public; served only through the
-- admin panel via signed URLs from the "resources" Storage bucket.
-- Written only by server-side code (service role), like invitations.
-- ============================================================

create table resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  file_name    text not null,
  storage_key  text not null,
  content_type text,
  file_size    bigint,
  uploaded_by  uuid not null references admin_profiles(id),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index resources_created_idx on resources (created_at desc) where deleted_at is null;

alter table resources enable row level security;
-- intentionally zero policies: read/write only via service-role server
-- actions, which check is_active_admin() themselves before touching this.
