-- Supports the new Member Network design: class year, team assignment,
-- and linking a member row to the admin account that should see it as
-- "themselves" first. admin_id is an explicit override; when it's
-- null the app falls back to matching members.name against
-- admin_profiles.display_name, so nobody has to manually wire this up
-- for it to work for most people.

alter table members add column class_of text;
alter table members add column team text;
alter table members add column admin_id uuid references admin_profiles(id);
