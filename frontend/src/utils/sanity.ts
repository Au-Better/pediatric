import { sanityClient } from "sanity:client";
import type { PortableTextBlock } from "@portabletext/types";
import groq from "groq";

const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

// visualEditingEnabled=true: fetch draft content with stega encoding (local/staging with Presentation tool)
// visualEditingEnabled=false: fetch published content from CDN (production)
async function loadQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  return sanityClient.fetch<T>(
    query,
    params,
    {
      perspective: visualEditingEnabled ? 'drafts' : 'published',
      useCdn: !visualEditingEnabled,
      ...(visualEditingEnabled && token ? { token, stega: true } : {}),
    }
  );
}

// Shared image projection — dereferences asset to include dimensions and LQIP
const imageProjection = `{
  ...,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
}`;

export interface SanityImage {
  _type: "image";
  asset?: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  /** Original image width in pixels, from asset metadata */
  width: number;
  /** Original image height in pixels, from asset metadata */
  height: number;
  /** Low-quality image placeholder (base64 data URL) */
  lqip?: string;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
}

/** Text shared by the whole site, from the single siteSettings document. */
export interface SiteSettings {
  siteName?: string;
  splashHeadline?: string;
  splashIntro?: string;
  medicalButtonLabel?: string;
  familyButtonLabel?: string;
  /** Only an explicit true lets search engines list the site; missing or false keeps it hidden. */
  showInSearchEngines?: boolean;
}

/** A page as the site needs it. parentId links it to the page above it in the tree. */
export interface PageSummary {
  _id: string;
  title?: string;
  slug: string;
  parentId?: string | null;
  intro?: string;
  body?: PortableTextBlock[];
  mainImage?: SanityImage;
  seo?: Seo;
  /** How the buttons to this page's sub-pages look, picked in the Studio's "Menu button style" field. */
  menuStyle?: "list" | "grid";
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return loadQuery<SiteSettings | null>(
    groq`*[_id == "siteSettings"][0]{
      siteName,
      splashHeadline,
      splashIntro,
      medicalButtonLabel,
      familyButtonLabel,
      showInSearchEngines
    }`,
  );
}

export async function getPages(): Promise<PageSummary[]> {
  return loadQuery<PageSummary[]>(
    groq`*[_type == "page" && defined(slug.current)]{
      _id,
      title,
      menuStyle,
      "slug": slug.current,
      "parentId": parent._ref,
      intro,
      body,
      mainImage ${imageProjection},
      seo {
        ...,
        ogImage ${imageProjection}
      }
    }`,
  );
}

/**
 * Builds a page's web address by walking up its parents, such as "/families/learn/vaccines".
 * The seen-set stops a page list that loops back on itself from running forever.
 */
export function pagePath(page: PageSummary, pages: PageSummary[]): string {
  const byId = new Map(pages.map((p) => [p._id, p]));
  const segments: string[] = [];
  const seen = new Set<string>();
  let current: PageSummary | undefined = page;
  while (current && !seen.has(current._id)) {
    seen.add(current._id);
    segments.unshift(current.slug);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return `/${segments.join("/")}`;
}
