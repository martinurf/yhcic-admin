-- ============================================================
-- Distinguishes the sole technical/infrastructure owner from
-- panel-only officers. Only the owner sees publish Requests —
-- everyone else just sends them.
-- ============================================================

alter table admin_profiles add column is_owner boolean not null default false;
