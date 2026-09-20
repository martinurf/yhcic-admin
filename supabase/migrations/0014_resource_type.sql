-- Lets a source be tagged by what it is (data feed, filing, article,
-- document, or a plain note) so the library can be filtered, matching
-- the approved Content Library design.

alter table resources add column type text not null default 'NOTE'
  check (type in ('ARTICLE', 'DATA', 'FILINGS', 'DOCUMENT', 'NOTE'));
