-- ============================================================
-- Private vs. shared drafts for Projects and Announcements.
--
-- Until now every draft was implicitly shared — any active admin
-- could already read and write any row via is_active_admin(). This
-- adds a real private lane: an officer can keep a draft to themself
-- (is_private = true) until they're ready to bring it into the shared
-- club workspace, at which point flipping it to false is what makes
-- it visible/editable by everyone else. Published rows are never
-- private in practice (publishing implies sharing), but that's
-- enforced in the application layer, not with a DB constraint here.
-- ============================================================

alter table projects add column is_private boolean not null default false;
alter table announcements add column is_private boolean not null default false;

-- ---- projects: read/update now respect is_private ----
drop policy projects_admin_read_all on projects;
create policy projects_admin_read_all
  on projects for select
  to authenticated
  using (is_active_admin() and (not is_private or created_by = auth.uid()));

drop policy projects_admin_update on projects;
create policy projects_admin_update
  on projects for update
  to authenticated
  using (is_active_admin() and (not is_private or created_by = auth.uid()))
  with check (is_active_admin() and (not is_private or created_by = auth.uid()));

-- ---- announcements: same treatment ----
drop policy announcements_admin_read_all on announcements;
create policy announcements_admin_read_all
  on announcements for select
  to authenticated
  using (is_active_admin() and (not is_private or created_by = auth.uid()));

drop policy announcements_admin_update on announcements;
create policy announcements_admin_update
  on announcements for update
  to authenticated
  using (is_active_admin() and (not is_private or created_by = auth.uid()))
  with check (is_active_admin() and (not is_private or created_by = auth.uid()));

-- insert policies (projects_admin_insert / announcements_admin_insert)
-- are untouched — any active admin can still create a row of either
-- visibility; is_private only ever gates read/update of a row that
-- already exists.
