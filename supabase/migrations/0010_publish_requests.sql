-- ============================================================
-- Members and Projects don't auto-publish. An officer's "Send
-- request" just timestamps requested_at; Martín reviews it and adds
-- it to the static public site by hand, then flips `published` here
-- to mark it done. `published` was already the "live on the public
-- site" flag — this just changes who's allowed to set it in spirit
-- (the UI stops exposing that control to the requesting officer).
-- ============================================================

alter table members add column requested_at timestamptz;
alter table projects add column requested_at timestamptz;
