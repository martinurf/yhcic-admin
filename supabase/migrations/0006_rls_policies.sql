-- ============================================================
-- YHCIC admin panel — schema, part 6: Row-Level Security.
-- This is the real access-control boundary, enforced by the database
-- itself — not just something the application code remembers to check.
-- Default is deny; every table below gets RLS enabled and only the
-- narrowest policies actually needed.
--
-- Three roles this schema cares about:
--   anon           the public site's build step, using the public anon key —
--                   read-only, published content only, never PII
--   authenticated  a logged-in admin, via the panel — checked against
--                   admin_profiles.active, not just "has a session"
--   service_role   the backend's own server-side code — bypasses RLS by
--                   design (Supabase default), used for invitations,
--                   application intake, revisions, audit events, and
--                   anything that must not be forgeable from a client
-- ============================================================

create or replace function is_active_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_profiles
    where id = auth.uid() and active = true
  );
$$;

-- ---- admin_profiles ------------------------------------------------
alter table admin_profiles enable row level security;

create policy admin_can_read_own_profile
  on admin_profiles for select
  to authenticated
  using (id = auth.uid());

-- no insert/update/delete policy for any client role — account creation,
-- disabling, and role changes happen only through server-side code
-- using the service role key.

-- ---- invitations -----------------------------------------------------
alter table invitations enable row level security;
-- intentionally zero policies: invitations are created, read, and
-- revoked only by server-side code (service role). Not even an
-- authenticated admin queries this table directly.

-- ---- applications ------------------------------------------------
alter table applications enable row level security;
alter table application_status_history enable row level security;

create policy admin_can_read_applications
  on applications for select
  to authenticated
  using (is_active_admin());

create policy admin_can_update_application_status
  on applications for update
  to authenticated
  using (is_active_admin())
  with check (is_active_admin());
-- no insert policy for any client role: the public form goes through
-- the owned intake endpoint (service role), never a direct client insert.

create policy admin_can_read_status_history
  on application_status_history for select
  to authenticated
  using (is_active_admin());
-- writes to history happen only via a server-side trigger/function
-- alongside a status update, using the service role.

-- ---- content tables (projects, goals, members, announcements) ----
do $$
declare t text;
begin
  foreach t in array array['projects', 'goals', 'members', 'announcements'] loop
    execute format('alter table %I enable row level security', t);

    execute format($f$
      create policy %I on %I for select
      to anon
      using (published = true and deleted_at is null)
    $f$, t || '_public_read', t);

    execute format($f$
      create policy %I on %I for select
      to authenticated
      using (is_active_admin())
    $f$, t || '_admin_read_all', t);

    execute format($f$
      create policy %I on %I for insert
      to authenticated
      with check (is_active_admin())
    $f$, t || '_admin_insert', t);

    execute format($f$
      create policy %I on %I for update
      to authenticated
      using (is_active_admin())
      with check (is_active_admin())
    $f$, t || '_admin_update', t);

    -- deliberately no delete policy for any role — soft delete (setting
    -- deleted_at via update) is the only supported path, so a mistake
    -- is always recoverable and there is no hard-delete API surface at all
  end loop;
end $$;

-- ---- media ---------------------------------------------------------
alter table media enable row level security;

create policy media_public_read
  on media for select
  to anon
  using (status = 'published');

create policy media_admin_read_all
  on media for select
  to authenticated
  using (is_active_admin());

create policy media_admin_insert
  on media for insert
  to authenticated
  with check (is_active_admin());

create policy media_admin_update
  on media for update
  to authenticated
  using (is_active_admin())
  with check (is_active_admin());

-- ---- content_revisions, audit_events, publications ----------------
alter table content_revisions enable row level security;
alter table audit_events enable row level security;
alter table publications enable row level security;

create policy revisions_admin_read
  on content_revisions for select
  to authenticated
  using (is_active_admin());

create policy audit_admin_read
  on audit_events for select
  to authenticated
  using (is_active_admin());

create policy publications_admin_read
  on publications for select
  to authenticated
  using (is_active_admin());
-- writes to all three happen only via service-role server code —
-- never directly from an authenticated client session, so a revision
-- or audit entry can't be skipped or forged by anything the browser runs.
