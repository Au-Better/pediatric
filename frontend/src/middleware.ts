import { defineMiddleware } from "astro:middleware";
import { countSkipped, countVisit, visitKind } from "./utils/visits";

type WaitUntil = { waitUntil(promise: Promise<unknown>): void };

// Counts page views after the page is sent, so visitors never wait on it.
// Crawlers and scripts are tallied separately and left out of the counts.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  try {
    const kind = visitKind(context.request, response, context.url);
    if (kind) {
      const counting = (
        kind === "person"
          ? countVisit(context.request, context.url)
          : countSkipped(context.request, kind)
      ).catch((error) => console.error("Visitor counter failed", error));
      const cfContext = (context.locals as { cfContext?: WaitUntil }).cfContext;
      if (cfContext) cfContext.waitUntil(counting);
      else await counting;
    }
  } catch (error) {
    console.error("Visitor counter failed", error);
  }

  return response;
});
