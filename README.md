# YHCIC admin backend

The private panel's backend: Supabase (Postgres + Auth + Storage), a
Next.js app, deployed as its own Vercel project — separate from the
public site and from the market proxy. This is where all real secrets
and PII-handling code live; the public site holds none of either.

## Status

**Schema only, so far.** `supabase/migrations/` is real, reviewable SQL —
six migrations covering admin accounts, invitations, the four content
types (projects/goals/members/announcements), applications, media
lifecycle, revisions, audit events, and publication-state tracking,
plus the Row-Level Security policies that are the actual access-control
boundary (not just something the app code remembers to check).

It has **not been run against a live database yet** — there is no
Supabase project to run it against. Nothing here should be treated as
verified until it's actually applied and exercised against a real
instance. The Next.js app (auth pages, admin screens, API routes) isn't
built yet for the same reason: writing 20 files of auth/database code
with no way to run any of it would produce exactly the kind of
unverified, untested code this whole project has been trying to avoid.

## What unblocks the rest

A Supabase project — URL, anon key, and service-role key. Once that
exists:

1. Run these migrations in order (Supabase SQL editor or CLI).
2. Set environment variables in this project's Vercel settings —
   `SUPABASE_URL`, `SUPABASE_ANON_KEY` (public-safe), `SUPABASE_SERVICE_ROLE_KEY`
   (server-only, never in a browser, never in the public site).
3. Build and test the Next.js app against the real instance, one piece
   at a time, verified as it goes — not all at once, unverified.

## Roles (matches the migrations exactly)

- `anon` — the public site's build step. Read-only, published content
  only, never sees an application or an admin profile.
- `authenticated` — a logged-in admin, gated by `admin_profiles.active`,
  not just by having a session.
- `service_role` — this backend's own server code. Bypasses RLS by
  design; used for invitations, application intake, revisions, and
  audit events — anything that must not be forgeable from a client.

## Ownership

Per the club's current governance decision: one technical owner holds
this project, GitHub org, and all infrastructure credentials. The other
panel administrators get invitation-only accounts *inside the app* —
never infrastructure access. See the schema comments in
`0001_admin_and_invitations.sql` and `0006_rls_policies.sql` for how
that's enforced at the database level, not just assumed.
