// Where a visit came from, worked out from the page request's Referer header.
//
// Browsers send the Referer header when someone follows a link to a page. Most
// sites (Google and Bing included) only let the browser send their address, not
// the page or search, so the counter only ever looks at the referring site's
// name. Nothing else from the header is kept: no page, search words or query.
//
// Clicks from one aubetter.org page to another aren't a source: they're counted
// under whatever first brought that visitor to the site today.

/** What kind of place a visit came from. */
export type SourceKind =
  /** A search engine: Google, Bing, DuckDuckGo, Yahoo and others, by name. */
  | "search"
  /** An AI assistant that linked to the site: ChatGPT, Perplexity, Gemini and others. */
  | "ai"
  /** Any other website that links to the site, by its address (facebook.com ...). */
  | "site"
  /** An Android app that opened the link, by the app's id. */
  | "app"
  /** No referrer: typed in, a bookmark, a link in an email, text or most apps. */
  | "direct"
  /** A referrer that can't be read, or a visitor whose first page today wasn't seen. */
  | "unknown";

export interface VisitSource {
  kind: SourceKind;
  /** "Google", "Bing", "facebook.com", "Direct" ... */
  source: string;
}

export const DIRECT: VisitSource = { kind: "direct", source: "Direct" };
export const UNKNOWN_SOURCE: VisitSource = {
  kind: "unknown",
  source: "Unknown",
};

/** The site's own addresses: links between them aren't a source. */
const SITE_HOSTS = new Set(["aubetter.org", "www.aubetter.org"]);

/** Every Google search address: google.com, google.de, google.co.uk, google.com.au ... */
const GOOGLE_SEARCH = /^(www\.)?google\.(com|[a-z]{2}|com?\.[a-z]{2})$/;

/** Search engines other than Google, matched on the site's name or any part of it. */
const SEARCH_ENGINES: ReadonlyArray<[RegExp, string]> = [
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)search\.yahoo\.(com|co\.jp)$/, "Yahoo"],
  [/^(www\.)?yahoo\.co\.jp$/, "Yahoo"],
  [/(^|\.)yandex\.(com|ru|by|kz|ua|com\.tr)$/, "Yandex"],
  [/^(www\.)?ya\.ru$/, "Yandex"],
  [/(^|\.)baidu\.com$/, "Baidu"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/^search\.brave\.com$/, "Brave Search"],
  [/(^|\.)startpage\.com$/, "Startpage"],
  [/(^|\.)qwant\.com$/, "Qwant"],
  [/(^|\.)kagi\.com$/, "Kagi"],
  [/(^|\.)mojeek\.com$/, "Mojeek"],
  [/(^|\.)naver\.com$/, "Naver"],
  [/(^|\.)search\.aol\.com$/, "AOL"],
  [/(^|\.)ask\.com$/, "Ask"],
  [/(^|\.)seznam\.cz$/, "Seznam"],
  [/(^|\.)sogou\.com$/, "Sogou"],
  [/^scholar\.google\.(com|[a-z]{2}|com?\.[a-z]{2})$/, "Google Scholar"],
];

/** AI assistants that link to the pages they cite. */
const AI_ASSISTANTS: ReadonlyArray<[RegExp, string]> = [
  [/^(www\.)?chatgpt\.com$/, "ChatGPT"],
  [/^chat\.openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/^gemini\.google\.com$/, "Gemini"],
  [/^copilot\.microsoft\.com$/, "Copilot"],
  [/^(www\.)?claude\.ai$/, "Claude"],
  [/^chat\.deepseek\.com$/, "DeepSeek"],
  [/^(www\.)?meta\.ai$/, "Meta AI"],
];

/** Link wrappers that stand for a better-known site. */
const SITE_ALIASES: Readonly<Record<string, string>> = {
  "t.co": "x.com",
  "twitter.com": "x.com",
  "lnkd.in": "linkedin.com",
  "youtu.be": "youtube.com",
  "out.reddit.com": "reddit.com",
};

/** Android apps that are really a search engine. */
const SEARCH_APPS: Readonly<Record<string, string>> = {
  "com.google.android.googlequicksearchbox": "Google",
};

/** Subdomains that only mean "mobile" or "link redirect": facebook.com, not l.facebook.com. */
const MOBILE_OR_REDIRECT = /^(www|m|l|lm|mobile|amp)\./;

function cap(text: string): string {
  return text.slice(0, 100);
}

/**
 * Where a visit came from, from the page request's Referer header, or null when
 * the link was on the site itself (a click from one of its pages to another).
 * `siteHost` is the address the page was opened at, so links on localhost or a
 * preview address count as the site too.
 */
export function visitSource(
  referrer: string | null,
  siteHost: string,
): VisitSource | null {
  const text = (referrer ?? "").trim();
  if (!text) return DIRECT;

  // Android tells sites which app opened a link: android-app://com.example.app/
  const app = /^android-app:\/\/([a-z0-9_.]+)/i.exec(text);
  if (app) {
    const id = app[1].toLowerCase();
    const search = SEARCH_APPS[id];
    if (search) return { kind: "search", source: search };
    return { kind: "app", source: cap(id) };
  }

  let host: string;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      return UNKNOWN_SOURCE;
    host = url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return UNKNOWN_SOURCE;
  }
  if (!host) return UNKNOWN_SOURCE;

  if (SITE_HOSTS.has(host) || host === siteHost.toLowerCase()) return null;

  if (GOOGLE_SEARCH.test(host)) return { kind: "search", source: "Google" };
  for (const [pattern, name] of AI_ASSISTANTS)
    if (pattern.test(host)) return { kind: "ai", source: name };
  for (const [pattern, name] of SEARCH_ENGINES)
    if (pattern.test(host)) return { kind: "search", source: name };

  const site = SITE_ALIASES[host] ?? host.replace(MOBILE_OR_REDIRECT, "");
  return { kind: "site", source: cap(SITE_ALIASES[site] ?? site) };
}
