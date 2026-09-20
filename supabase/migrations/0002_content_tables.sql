-- ============================================================
-- YHCIC admin panel — schema, part 2: the content the panel manages.
-- Same shape for all four: published/soft-delete/attribution/timestamps.
-- The public site's build step reads only published, non-deleted rows
-- (see 0005_rls_policies.sql) and bakes them into the static snapshot —
-- it never queries this live at runtime.
-- ============================================================

create table projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      text not null,               -- e.g. "In Development", "Active", "Planned"
  code        text,
  body        text not null,
  sort_order  integer not null default 0,
  published   boolean not null default false,
  media_id    uuid,                        -- FK added in 0004 after media exists
  created_by  uuid not null references admin_profiles(id),
  updated_by  uuid not null references admin_profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table goals (
  id          uuid primary key default gen_random_uuid(),
  n           text not null,               -- "01", "02", ...
  stage       text not null,
  title       text not null,
  body        text not null,
  sort_order  integer not null default 0,
  published   boolean not null default false,
  created_by  uuid not null references admin_profiles(id),
  updated_by  uuid not null references admin_profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  major       text,
  focus       text,
  linkedin    text,
  media_id    uuid,                        -- FK added in 0004
  sort_order  integer not null default 0,
  published   boolean not null default false,
  created_by  uuid not null references admin_profiles(id),
  updated_by  uuid not null references admin_profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,               -- plain text / restricted Markdown, never raw HTML
  media_id    uuid,                        -- FK added in 0004
  published   boolean not null default false,
  published_at timestamptz,
  created_by  uuid not null references admin_profiles(id),
  updated_by  uuid not null references admin_profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index projects_published_idx      on projects (published, deleted_at, sort_order);
create index goals_published_idx         on goals (published, deleted_at, sort_order);
create index members_published_idx       on members (published, deleted_at, sort_order);
create index announcements_published_idx on announcements (published, deleted_at, published_at desc);
