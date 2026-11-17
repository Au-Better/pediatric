// A small, cookie-free visitor counter.
//
// Each real page view adds to today's totals in the VISITS database (Cloudflare D1).
// A visitor is counted once a day using a hash of today's random salt, their IP
// address and their browser's user agent. The IP address is never stored, and the
// salt and hashes are deleted when the day ends, so nobody can be followed from
// one day to the next. Only the daily totals and per-page counts are kept.
import { env } from "cloudflare:workers";

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

/** True when this request is a person opening a page that exists. */
export function shouldCount(
  request: Request,
  response: Response,
  url: URL,
): boolean {
  if (request.method !== "GET") return false;
  if (response.status !== 200) return false;
  if (!(response.headers.get("content-type") ?? "").includes("text/html"))
    return false;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || NOT_A_PERSON.test(userAgent)) return false;

  // Browser prefetches, and previews inside Sanity Studio, aren't visits.
  const purpose = `${request.headers.get("sec-purpose") ?? ""} ${request.headers.get("purpose") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) return false;
  if (url.searchParams.has("sanity-preview-perspective")) return false;
  const referrer = request.headers.get("referer") ?? "";
  if (/\.sanity\.studio|sanity\.io/i.test(referrer)) return false;

  return true;
}

function cleanPath(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path.slice(0, 200) || "/";
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
}
