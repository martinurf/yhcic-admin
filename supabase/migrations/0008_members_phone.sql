-- Swap LinkedIn for a phone number on member profiles — nobody had
-- filled LinkedIn in yet, so this is a clean drop, not a migration
-- of real data.

alter table members add column phone text;
alter table members drop column linkedin;
