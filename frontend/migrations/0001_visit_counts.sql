-- Daily visitor counts for aubetter.org. No cookies, no IP addresses stored.
-- "day" is the calendar day in Albuquerque time (America/Denver), as YYYY-MM-DD.

-- One total per day: unique visitors and page views.
CREATE TABLE IF NOT EXISTS daily (
  day TEXT PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0
);

-- Page views per page per day.
CREATE TABLE IF NOT EXISTS pages (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);

-- Today's random salt. Deleted once the day is over, so a visitor's hash
-- can never be worked back to them or matched to another day.
CREATE TABLE IF NOT EXISTS salts (
  day TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);

-- Today's anonymous visitor hashes, only used to count each visitor once a day.
-- Deleted once the day is over; only the totals above are kept.
CREATE TABLE IF NOT EXISTS visitors (
  day TEXT NOT NULL,
  hash TEXT NOT NULL,
  PRIMARY KEY (day, hash)
);
