// Helpers that tell search engines and AI tools what the site is and which pages to list.
// Layout.astro uses them for every page's <head>, and so do /sitemap.xml and /llms.txt.
import type { PortableTextBlock } from "@portabletext/types";
import {
  getSiteSettings,
  isRealText,
  isUnderDevelopment,
  pagePath,
  type PageSummary,
} from "./sanity";

export const SITE_NAME = "Au Better";
/** The site's main address, with no slash at the end. Matches `site` in astro.config.mjs. */
export const SITE_URL = "https://aubetter.org";
/** Used on the home page, in /llms.txt and on any page that has no description of its own. */
export const SITE_DESCRIPTION =
  "Au Better offers free tools and plain-language guides for families and medical professionals, serving our most important yet most vulnerable community members: children.";

/**
 * True when search engines may list the site's pages. BOTH must be true:
 * 1. "Show the site in search engines" is switched on in the Studio's Site settings, and
 * 2. the page was served from the main address (not workers.dev, a preview link, or a local copy).
 * If the setting can't be read, the answer is no rather than a guess.
 */
export async function isListedInSearchEngines(url: URL): Promise<boolean> {
  if (url.hostname !== new URL(SITE_URL).hostname) return false;
  try {
    const settings = await getSiteSettings();
    return settings?.showInSearchEngines === true;
  } catch {
    return false;
  }
}

/**
 * A page's one true address on the main site, such as https://aubetter.org/families. A slash at
 * the end is dropped, so /families and /families/ count as one page rather than two.
 */
export function canonicalUrl(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return new URL(path || "/", SITE_URL).href;
}

/** A page title with the site's name after it, as search results show it: "Finances — Au Better". */
export function withSiteName(title: string | undefined): string {
  if (!title) return SITE_NAME;
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
}

/** The plain text of Studio body content, one paragraph after another. */
export function plainText(blocks: PortableTextBlock[] | undefined): string {
  return (blocks ?? [])
    .filter((block) => block._type === "block")
    .map((block) =>
      (block.children ?? [])
        .map((child) => (typeof child.text === "string" ? child.text : ""))
        .join(""),
    )
    .filter((text) => isRealText(text))
    .join(" ");
}

/** Shortens text to about the length search results show (160 characters), at a word break. */
export function shortDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—-]+$/, "")}…`;
}

/**
 * A Studio page's description for search results, from the first of these that has real text
 * (placeholder text is skipped): the SEO field's meta description, the intro, the body.
 * Returns undefined when none has, so the caller can fall back to the site's description.
 */
export function pageDescription(page: PageSummary): string | undefined {
  if (isRealText(page.seo?.metaDescription)) return shortDescription(page.seo!.metaDescription!);
  if (isRealText(page.intro)) return shortDescription(page.intro!);
  const body = plainText(page.body);
  return body ? shortDescription(body) : undefined;
}

/** The Studio pages that search engines and AI tools should know about: every built page. */
export function listedPages(pages: PageSummary[]): PageSummary[] {
  return pages.filter((page) => !isUnderDevelopment(page, pages));
}

/** A page and the pages above it, from the top of the site down, for breadcrumbs. */
export function pageTrail(page: PageSummary, pages: PageSummary[]): PageSummary[] {
  const byId = new Map(pages.map((p) => [p._id, p]));
  const trail: PageSummary[] = [];
  const seen = new Set<string>();
  let current: PageSummary | undefined = page;
  while (current && !seen.has(current._id)) {
    seen.add(current._id);
    trail.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return trail;
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** What a page is, in schema.org terms (https://schema.org/WebPage and its kinds). */
export type PageKind = "WebPage" | "AboutPage" | "CollectionPage" | "MedicalWebPage";

export interface PageInfo {
  /** The page's own name, without the site's name after it. */
  name: string;
  description?: string;
  /** The page's canonical address. */
  url: string;
  kind?: PageKind;
  /** The pages above this one, top first, then this page: shown as a breadcrumb trail. */
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * The structured data (JSON-LD) that tells search engines and AI tools who runs the site and what
 * the page is. Every page carries the same Organization and WebSite, plus its own page entry.
 * The founder and founding year come from the About page; update them here if that page changes.
 */
export function structuredData(page: PageInfo): Record<string, unknown> {
  const pageId = `${page.url}#webpage`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 480,
        height: 561,
      },
      description: SITE_DESCRIPTION,
      foundingDate: "2026",
      founder: { "@type": "Person", name: "Jake Soens" },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "en-US",
    },
    {
      "@type": page.kind ?? "WebPage",
      "@id": pageId,
      url: page.url,
      name: page.name,
      ...(page.description ? { description: page.description } : {}),
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "en-US",
      ...(page.breadcrumbs && page.breadcrumbs.length > 1
        ? { breadcrumb: { "@id": `${page.url}#breadcrumb` } }
        : {}),
    },
  ];

  if (page.breadcrumbs && page.breadcrumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${page.url}#breadcrumb`,
      itemListElement: page.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON for a <script type="application/ld+json"> tag, with "<" escaped so text can't end the tag early. */
export function jsonForScriptTag(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** A Studio page's breadcrumb trail: Home, the pages above it, then the page itself. */
export function breadcrumbsFor(page: PageSummary, pages: PageSummary[]) {
  return [
    { name: "Home", url: canonicalUrl("/") },
    ...pageTrail(page, pages).map((p) => ({
      name: p.title || SITE_NAME,
      url: canonicalUrl(pagePath(p, pages)),
    })),
  ];
}
