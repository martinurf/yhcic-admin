-- ============================================================
-- "Make a copy" + comment thread, for projects and sources.
--
-- No propose-changes flow: anyone can copy someone else's project or
-- source into their own working copy (a fork), edit it freely, and it
-- shows up as a record on the original's thread the moment it's
-- created — like a social feed, not a private draft awaiting approval.
-- A fork's forker is the only one who can ever edit that fork, no
-- matter what is_private says (is_private only still matters for
-- rows that AREN'T forks). Separate from that: anyone can leave a
-- plain-text comment on a project or source's thread.
--
-- Once a fork (or the original) is where someone wants it, they use
-- the existing "Request public" flow already in place — Martín
-- reviews and publishes to the public site himself. Forking has
-- nothing to do with that review step.
-- ============================================================

alter table projects add column forked_from_id uuid references projects(id);
alter table resources add column forked_from_id uuid references resources(id);

drop policy projects_admin_update on projects;
create policy projects_admin_update
  on projects for update
  to authenticated
  using (
    is_active_admin() and (
      (forked_from_id is not null and created_by = auth.uid())
      or (forked_from_id is null and (not is_private or created_by = auth.uid()))
    )
  )
  with check (
    is_active_admin() and (
      (forked_from_id is not null and created_by = auth.uid())
      or (forked_from_id is null and (not is_private or created_by = auth.uid()))
    )
  );

create table content_comments (
  id          uuid primary key default gen_random_uuid(),
  parent_table text not null check (parent_table in ('projects', 'resources')),
  parent_id   uuid not null,
  author_id   uuid not null references admin_profiles(id),
  body        text not null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index content_comments_parent_idx on content_comments (parent_table, parent_id, created_at) where deleted_at is null;

alter table content_comments enable row level security;

create policy comments_admin_read
  on content_comments for select
  to authenticated
  using (is_active_admin());

create policy comments_admin_insert
  on content_comments for insert
  to authenticated
  with check (is_active_admin() and author_id = auth.uid());

create policy comments_author_delete
  on content_comments for update
  to authenticated
  using (is_active_admin() and author_id = auth.uid())
  with check (is_active_admin() and author_id = auth.uid());
