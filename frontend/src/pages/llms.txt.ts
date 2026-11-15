// /llms.txt: a short, plain-text guide to the site for AI assistants (https://llmstxt.org).
// It lists every built page with its description, grouped by the site's sections, and is built
// from the Studio on each visit, so new pages appear on their own once published. While "Show
// the site in search engines" is off in the Studio's Site settings, it isn't served.
import type { APIRoute } from "astro";
import { getPages, pagePath, type PageSummary } from "../utils/sanity";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  canonicalUrl,
  isListedInSearchEngines,
  listedPages,
  pageDescription,
} from "../utils/seo";

/** One line per page: a link with the page's title, then its description. */
const line = (title: string, href: string, description?: string) =>
  `- [${title.replace(/[[\]]/g, "")}](${canonicalUrl(href)})${description ? `: ${description.replace(/\s+/g, " ")}` : ""}`;

export const GET: APIRoute = async ({ url }) => {
  if (!(await isListedInSearchEngines(url))) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const pages = await getPages();
  const listed = listedPages(pages);
  const listedIds = new Set(listed.map((p) => p._id));
  const pageLine = (page: PageSummary) =>
    line(page.title || SITE_NAME, pagePath(page, pages), pageDescription(page));

  // A top-level page's built pages below it, in the order the site shows them.
  const descendants = (parent: PageSummary): PageSummary[] =>
    listed
      .filter((p) => p.parentId === parent._id)
      .flatMap((child) => [child, ...descendants(child)]);

  const topLevel = listed.filter((p) => !p.parentId || !listedIds.has(p.parentId));
  const sections = topLevel.filter((p) => descendants(p).length > 0);
  const standalone = topLevel.filter((p) => descendants(p).length === 0);

  const text = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Au Better is written for two audiences: parents, family members and patients, and medical professionals. Its resources are free and educational. They are in no way a replacement for the advice of a licensed medical professional who knows you or your loved one's situation.",
    "",
    ...sections.flatMap((section) => [
      `## ${section.title || SITE_NAME}`,
      "",
      pageLine(section),
      ...descendants(section).map(pageLine),
      "",
    ]),
    "## More from Au Better",
    "",
    line(
      "Interactive Tools",
      "/interactive-tools",
      "All of Au Better's interactive tools in one place.",
    ),
    ...standalone.map(pageLine),
    "",
  ].join("\n");

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
