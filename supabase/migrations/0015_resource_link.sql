-- Sources are primarily links (the approved design's source form is
-- title + url + note + type, no file required) — file_name/storage_key
-- were wrongly mandatory, which made every source a file upload. This
-- adds a url column and lets a source be a link, a file, or both.

alter table resources add column url text;
alter table resources alter column file_name drop not null;
alter table resources alter column storage_key drop not null;
alter table resources add constraint resources_has_link_or_file
  check (url is not null or storage_key is not null);
