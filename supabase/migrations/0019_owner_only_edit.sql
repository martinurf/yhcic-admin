-- Editing someone else's work directly is gone entirely — private or
-- shared, only the creator can ever update a project. The earlier
-- "shared drafts are editable by any active admin" behavior is what
-- this replaces; the only way to build on someone else's project now
-- is to make a copy (see 0018) and work there. is_private still
-- controls who can SEE a private draft — it just no longer affects
-- who can edit a shared one.

drop policy projects_admin_update on projects;
create policy projects_admin_update
  on projects for update
  to authenticated
  using (is_active_admin() and created_by = auth.uid())
  with check (is_active_admin() and created_by = auth.uid());
