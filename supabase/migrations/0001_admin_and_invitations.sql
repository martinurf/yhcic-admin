-- ============================================================
-- YHCIC admin panel — schema, part 1: who can get in.
-- Login is by username; the real email lives here privately and
-- is used only for invitation delivery and Supabase Auth's own
-- password-recovery flow. The username→email lookup used at sign-in
-- happens only in a server-side route — never a public RLS-readable
-- query (see 0005_rls_policies.sql).
-- ============================================================

create extension if not exists "pgcrypto";

create table admin_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null,
  display_name text not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- case-insensitive uniqueness: "Martin", "martin", " MARTIN " are one account
create unique index admin_profiles_username_ci_idx
  on admin_profiles (lower(trim(username)));

alter table admin_profiles
  add constraint admin_profiles_username_length
  check (char_length(trim(username)) between 3 and 24);

alter table admin_profiles
  add constraint admin_profiles_username_charset
  check (username ~ '^[a-zA-Z0-9_]+$');

-- invitation-only account creation. A row here is a claim ticket,
-- not an account — the account is created only when the invited
-- person completes it with the token, before which nothing in
-- admin_profiles exists for them.
create table invitations (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  token_hash   text not null, -- store a hash of the token, never the token itself
  invited_by   uuid not null references admin_profiles(id),
  expires_at   timestamptz not null,
  accepted_at  timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index invitations_email_idx on invitations (lower(email));
