-- ============================================================
-- Invitations no longer collect a real email up front — the person
-- being invited sets everything up themselves on their own link.
-- This is purely for a friendlier label in the Team page's pending
-- list ("invited: Alex" instead of a generated placeholder address).
-- ============================================================

alter table invitations add column invited_name text;
