-- Where visits come from, per day: Google, Bing, another website, direct ...
-- Worked out from the Referer header the browser sends with each page request.
-- Only the referring site's name is kept, never the page, search words or query.
-- Clicks between aubetter.org's own pages count toward the source that first
-- brought that visitor today. No IP address is stored.
-- "day" is the calendar day in Albuquerque time (America/Denver), as YYYY-MM-DD.
--
-- "kind" is one of:
--   search   a search engine; "source" is its name (Google, Bing, DuckDuckGo ...)
--   ai       an AI assistant; "source" is its name (ChatGPT, Perplexity ...)
--   site     any other website; "source" is its address (facebook.com ...)
--   app      an Android app that opened the link; "source" is the app's id
--   direct   no referrer: typed in, a bookmark, or a link in an email, text or app
--   unknown  a referrer that can't be read, or a visitor whose first page today
--            wasn't seen (they arrived before midnight or before sources were counted)

-- One row per source per day: unique visitors from there and their page views.
CREATE TABLE IF NOT EXISTS sources (
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, source)
);

-- Today's anonymous visitor hashes per source, used to count each visitor once
-- a day per source and to credit their clicks between pages to where they came
-- from. Deleted once the day is over, like the visitors table; only the totals
-- in "sources" are kept.
CREATE TABLE IF NOT EXISTS source_visitors (
  day TEXT NOT NULL,
  hash TEXT NOT NULL,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (day, hash, kind, source)
);
