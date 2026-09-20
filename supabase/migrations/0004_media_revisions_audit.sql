-- ============================================================
-- YHCIC admin panel — schema, part 4: media lifecycle, content
-- revisions, and the audit trail.
-- ============================================================

create type media_status as enum ('staged', 'published', 'orphaned');

-- Every upload gets its own immutable object — editing an image never
-- overwrites the bytes behind an existing URL. A live static deployment,
-- a retained revision, or the recovery window can all still be pointing
-- at an "orphaned" row; physical deletion from Storage happens later,
-- out-of-band, only once nothing references it (see README in this repo).
create table media (
  id           uuid primary key default gen_random_uuid(),
  storage_key  text not null unique,     -- immutable, server-generated filename
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size    integer not null,
  width        integer not null,
  height       integer not null,
  status       media_status not null default 'staged',
  uploaded_by  uuid not null references admin_profiles(id),
  created_at   timestamptz not null default now(),
  orphaned_at  timestamptz
);

-- now that media exists, wire up the FKs left pending in 0002
alter table projects      add constraint projects_media_fk      foreign key (media_id) references media(id);
alter table members       add constraint members_media_fk       foreign key (media_id) references media(id);
alter table announcements add constraint announcements_media_fk foreign key (media_id) references media(id);

-- lightweight revisions: a snapshot of the row before each save, not a
-- diff/versioning system. Enough to undo "the right record, wrong
-- content" without restoring the whole database for one paragraph.
-- A rollback creates a new revision; history is never deleted by a rollback.
create table content_revisions (
  id            uuid primary key default gen_random_uuid(),
  content_type  text not null check (content_type in ('projects', 'goals', 'members', 'announcements')),
  content_id    uuid not null,
  previous_data jsonb not null,
  changed_by    uuid not null references admin_profiles(id),
  changed_at    timestamptz not null default now()
);

create index content_revisions_lookup_idx on content_revisions (content_type, content_id, changed_at desc);

-- append-only. Never contains application essays, secrets, or full
-- payloads — just enough to answer "who did what, when" for the
-- handful of actions that matter (publish, role change, revocation,
-- application status change, deletion).
create table audit_events (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references admin_profiles(id),
  action      text not null,             -- e.g. "publish", "invite", "revoke", "status_change"
  target_type text not null,
  target_id   uuid,
  metadata    jsonb,                     -- safe, minimal — never raw PII or secrets
  created_at  timestamptz not null default now()
);

create index audit_events_target_idx on audit_events (target_type, target_id, created_at desc);
