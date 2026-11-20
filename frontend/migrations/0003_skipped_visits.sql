-- Page views left out of the visitor counts because they look automated.
-- No IP address, browser or visitor hash is stored: only how many views, why,
-- and which network they came from (its number and name, from Cloudflare).
-- "day" is the calendar day in Albuquerque time (America/Denver), as YYYY-MM-DD.
--
-- "reason" is one of:
--   named_bot    the browser says it's a crawler, link preview, monitor or script
--   data_center  it comes from a cloud or hosting network (Amazon, Google Cloud ...)
--   no_language  no preferred language, which everyday browsers always send
-- "network" looks like "AS16509 Amazon.com, Inc.", or "Unknown".
CREATE TABLE IF NOT EXISTS skipped (
  day TEXT NOT NULL,
  reason TEXT NOT NULL,
  network TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, reason, network)
);
