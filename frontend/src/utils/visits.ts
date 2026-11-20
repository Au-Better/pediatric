// A small, cookie-free visitor counter.
//
// Each real page view adds to today's totals in the VISITS database (Cloudflare D1).
// A visitor is counted once a day using a hash of today's random salt, their IP
// address and their browser's user agent. The IP address is never stored, and the
// salt and hashes are deleted when the day ends, so nobody can be followed from
// one day to the next. Only the daily totals, per-page counts, per-place counts
// (country, state or region, city, from Cloudflare's own lookup) and per-source
// counts (Google, Bing, another site, direct ...; see visitSources.ts) are kept.
//
// Crawlers and scripts are left out of those counts. Their page views are tallied
// separately in the "skipped" table, by reason and network, so it's easy to see
// what was left out and to check that no real people were.
import { env } from "cloudflare:workers";
import { isDataCenter } from "./dataCenters";
import { UNKNOWN_SOURCE, visitSource, type VisitSource } from "./visitSources";

interface D1Result {
  results: Record<string, unknown>[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
}
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

/** Days start and end in Albuquerque time. */
const SITE_TIME_ZONE = "America/Denver";

/** Crawlers, link previews, monitors and scripts: not people. */
const NOT_A_PERSON =
  /bot|crawl|spider|slurp|archiver|scan|monitor|uptime|headless|lighthouse|pagespeed|preview|curl|wget|python|httpclient|okhttp|go-http|java\/|node-fetch|undici|axios|facebookexternalhit|embedly|whatsapp|discord|slack|telegram|vercel|cloudflare/i;

/** Today's date in the site's time zone, as YYYY-MM-DD. */
export function siteDay(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Why a page view was left out of the counts. */
export type SkipReason =
  /** The browser says it's a crawler, link preview, monitor or script. */
  | "named_bot"
  /** It comes from a cloud or hosting network, not a home, work or phone one. */
  | "data_center"
  /** No preferred language: every everyday browser sends one, many scripts don't. */
  | "no_language";

/**
 * What this request is: null when it isn't a page view at all (not a page, an
 * error, a prefetch or a Studio preview), "person" when it's someone opening a
 * page, or the reason it looks automated.
 */
export function visitKind(
  request: Request,
  response: Response,
  url: URL,
): "person" | SkipReason | null {
  if (request.method !== "GET") return null;
  if (response.status !== 200) return null;
  if (!(response.headers.get("content-type") ?? "").includes("text/html"))
    return null;

  // Browser prefetches, and previews inside Sanity Studio, aren't visits.
  const purpose = `${request.headers.get("sec-purpose") ?? ""} ${request.headers.get("purpose") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) return null;
  if (url.searchParams.has("sanity-preview-perspective")) return null;
  const referrer = request.headers.get("referer") ?? "";
  if (/\.sanity\.studio|sanity\.io/i.test(referrer)) return null;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || NOT_A_PERSON.test(userAgent)) return "named_bot";

  const { asn, organization } = visitNetwork(request);
  if (isDataCenter(asn, organization)) return "data_center";

  // Scripts that send a placeholder ("*") instead of a language count as none.
  const language = (request.headers.get("accept-language") ?? "").trim();
  if (!language || language === "*") return "no_language";

  return "person";
}

/** The network a request came from, as Cloudflare saw it (request.cf). */
export function visitNetwork(request: Request): {
  asn: number | undefined;
  organization: string;
} {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
  const asn =
    typeof cf?.asn === "number" && Number.isInteger(cf.asn)
      ? cf.asn
      : undefined;
  const organization =
    typeof cf?.asOrganization === "string"
      ? cf.asOrganization.trim().slice(0, 100)
      : "";
  return { asn, organization };
}

/** A network's number and name for the "skipped" table, like "AS16509 Amazon.com". */
export function networkLabel(request: Request): string {
  const { asn, organization } = visitNetwork(request);
  const label = [asn === undefined ? "" : `AS${asn}`, organization]
    .filter(Boolean)
    .join(" ");
  return label || "Unknown";
}

function cleanPath(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path.slice(0, 200) || "/";
}

/** Where a visit came from, as Cloudflare saw it. Never more precise than a city. */
export interface VisitPlace {
  country: string;
  region: string;
  city: string;
}

const UNKNOWN = "Unknown";

function placePart(value: unknown): string {
  if (typeof value !== "string") return UNKNOWN;
  const text = value.trim().slice(0, 100);
  return text || UNKNOWN;
}

/**
 * The visitor's country, state or region, and city, from the location Cloudflare
 * attaches to each request (request.cf). Anything missing is "Unknown".
 */
export function visitPlace(request: Request): VisitPlace {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
  const code = placePart(cf?.country);
  // Cloudflare uses XX when it can't tell the country.
  const country =
    code === UNKNOWN || code.toUpperCase() === "XX"
      ? UNKNOWN
      : code.toUpperCase();
  return {
    country,
    region: placePart(cf?.region),
    city: placePart(cf?.city),
  };
}

function randomHex(bytes: number): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(values, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** Adds one page view (and the visitor, if new today) to today's totals. */
export async function countVisit(request: Request, url: URL): Promise<void> {
  const db = env.VISITS as D1Database | undefined;
  if (!db) return;

  const day = siteDay();
  const [, saltResult] = await db.batch([
    db
      .prepare(
        "INSERT INTO salts (day, salt) VALUES (?1, ?2) ON CONFLICT(day) DO NOTHING",
      )
      .bind(day, randomHex(32)),
    db.prepare("SELECT salt FROM salts WHERE day = ?1").bind(day),
  ]);
  const salt = saltResult?.results[0]?.salt;
  if (typeof salt !== "string") return;

  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const hash = await sha256Hex(`${salt}|${ip}|${userAgent}`);

  await db.batch([
    db
      .prepare("INSERT OR IGNORE INTO visitors (day, hash) VALUES (?1, ?2)")
      .bind(day, hash),
    db
      .prepare(
        `INSERT INTO daily (day, visitors, page_views) VALUES (?1, 1, 1)
         ON CONFLICT(day) DO UPDATE SET
           page_views = page_views + 1,
           visitors = (SELECT COUNT(*) FROM visitors WHERE day = ?1)`,
      )
      .bind(day),
    db
      .prepare(
        `INSERT INTO pages (day, path, views) VALUES (?1, ?2, 1)
         ON CONFLICT(day, path) DO UPDATE SET views = views + 1`,
      )
      .bind(day, cleanPath(url.pathname)),
    // Yesterday's salt and hashes are no longer needed: forget them.
    db.prepare("DELETE FROM visitors WHERE day < ?1").bind(day),
    db.prepare("DELETE FROM salts WHERE day < ?1").bind(day),
  ]);

  // Places are counted separately, so a problem here never loses the totals above.
  try {
    await countPlace(db, day, hash, visitPlace(request));
  } catch (error) {
    console.error("Visitor place counter failed", error);
  }

  // Sources too, so a problem here never loses the totals or places above.
  try {
    await countSource(
      db,
      day,
      hash,
      visitSource(request.headers.get("referer"), url.hostname),
    );
  } catch (error) {
    console.error("Visitor source counter failed", error);
  }
}

/** Adds one page view (and the visitor, if new to this place today) to the place's totals. */
async function countPlace(
  db: D1Database,
  day: string,
  hash: string,
  place: VisitPlace,
): Promise<void> {
  const { country, region, city } = place;
  await db.batch([
    db
      .prepare(
        `INSERT OR IGNORE INTO location_visitors (day, hash, country, region, city)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(day, hash, country, region, city),
    db
      .prepare(
        `INSERT INTO locations (day, country, region, city, visitors, page_views)
         VALUES (?1, ?2, ?3, ?4, 1, 1)
         ON CONFLICT(day, country, region, city) DO UPDATE SET
           page_views = page_views + 1,
           visitors = (SELECT COUNT(*) FROM location_visitors
                       WHERE day = ?1 AND country = ?2 AND region = ?3 AND city = ?4)`,
      )
      .bind(day, country, region, city),
    // Yesterday's per-place hashes are no longer needed: forget them.
    db.prepare("DELETE FROM location_visitors WHERE day < ?1").bind(day),
  ]);
}

/**
 * Adds one page view (and the visitor, if new to this source today) to the
 * source's totals. A click from one of the site's own pages (source null) counts
 * toward whatever first brought this visitor today; if that wasn't seen (they
 * arrived before midnight, or before sources were counted), it counts as unknown.
 */
async function countSource(
  db: D1Database,
  day: string,
  hash: string,
  found: VisitSource | null,
): Promise<void> {
  let source = found;
  if (!source) {
    const [first] = await db.batch([
      db
        .prepare(
          `SELECT kind, source FROM source_visitors
           WHERE day = ?1 AND hash = ?2 ORDER BY rowid LIMIT 1`,
        )
        .bind(day, hash),
    ]);
    const row = first?.results[0];
    source =
      typeof row?.kind === "string" && typeof row?.source === "string"
        ? { kind: row.kind as VisitSource["kind"], source: row.source }
        : UNKNOWN_SOURCE;
  }

  const { kind, source: name } = source;
  await db.batch([
    db
      .prepare(
        `INSERT OR IGNORE INTO source_visitors (day, hash, kind, source)
         VALUES (?1, ?2, ?3, ?4)`,
      )
      .bind(day, hash, kind, name),
    db
      .prepare(
        `INSERT INTO sources (day, kind, source, visitors, page_views)
         VALUES (?1, ?2, ?3, 1, 1)
         ON CONFLICT(day, kind, source) DO UPDATE SET
           page_views = page_views + 1,
           visitors = (SELECT COUNT(*) FROM source_visitors
                       WHERE day = ?1 AND kind = ?2 AND source = ?3)`,
      )
      .bind(day, kind, name),
    // Yesterday's per-source hashes are no longer needed: forget them.
    db.prepare("DELETE FROM source_visitors WHERE day < ?1").bind(day),
  ]);
}

/**
 * Adds one page view to today's tally of views left out, by reason and network.
 * Nothing about the visitor is kept: no IP address, browser or hash.
 */
export async function countSkipped(
  request: Request,
  reason: SkipReason,
): Promise<void> {
  const db = env.VISITS as D1Database | undefined;
  if (!db) return;

  await db.batch([
    db
      .prepare(
        `INSERT INTO skipped (day, reason, network, views) VALUES (?1, ?2, ?3, 1)
         ON CONFLICT(day, reason, network) DO UPDATE SET views = views + 1`,
      )
      .bind(siteDay(), reason, networkLabel(request)),
  ]);
}
