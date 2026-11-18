-- Where visits come from, per day: country, state or region, and city.
-- The place comes from Cloudflare's own lookup of each request (request.cf).
-- No IP address is stored. A missing part of a place is saved as "Unknown".
-- "day" is the calendar day in Albuquerque time (America/Denver), as YYYY-MM-DD.

-- One row per place per day: unique visitors from there and their page views.
-- "country" is the two-letter country code (US, CA, MX ...).
CREATE TABLE IF NOT EXISTS locations (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country, region, city)
);

-- Today's anonymous visitor hashes per place, only used to count each visitor
-- once a day per place. Deleted once the day is over, like the visitors table;
-- only the totals in "locations" are kept.
CREATE TABLE IF NOT EXISTS location_visitors (
  day TEXT NOT NULL,
  hash TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  PRIMARY KEY (day, hash, country, region, city)
);
