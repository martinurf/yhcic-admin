-- Links an auto-created draft member back to the application it came
-- from, so accepting the same application twice (e.g. accept, reject,
-- accept again) can't spawn a second draft.

alter table members add column source_application_id uuid references applications(id);
create unique index members_source_application_idx on members(source_application_id) where source_application_id is not null;
