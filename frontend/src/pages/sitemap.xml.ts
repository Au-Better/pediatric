// The sitemap at /sitemap.xml: every built page on the site, so search engines can find them all.
// It is built from the Studio on each visit, so new pages appear on their own once published.
// Pages still under development are left out, and the list is empty while "Show the site in
// search engines" is off in the Studio's Site settings (or on any address but the main one).
import type { APIRoute } from "astro";
import { getPages, pagePath } from "../utils/sanity";
import { canonicalUrl, isListedInSearchEngines, listedPages } from "../utils/seo";

const escapeXml = (text: string) =>
  text.replace(
    /[<>&'"]/g,
    (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[c]};`,
  );

export const GET: APIRoute = async ({ url }) => {
  const entries: { loc: string; lastmod?: string }[] = [];

  if (await isListedInSearchEngines(url)) {
    const pages = await getPages();
    entries.push({ loc: canonicalUrl("/") }, { loc: canonicalUrl("/interactive-tools") });
    for (const page of listedPages(pages)) {
      entries.push({
        loc: canonicalUrl(pagePath(page, pages)),
        lastmod: page._updatedAt?.slice(0, 10),
      });
    }
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      ({ loc, lastmod }) =>
        `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
