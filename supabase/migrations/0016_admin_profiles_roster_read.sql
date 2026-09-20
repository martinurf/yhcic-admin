-- Project/source rows now show their author's name in the shared
-- workspace list, which means any active admin needs to read any other
-- active admin's basic profile (username/display_name only — nothing
-- sensitive lives here), not just their own. Without this, the author
-- join silently comes back null for everyone but yourself.

create policy admin_can_read_roster
  on admin_profiles for select
  to authenticated
  using (is_active_admin());
