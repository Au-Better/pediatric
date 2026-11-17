import { defineMiddleware } from "astro:middleware";
import { countVisit, shouldCount } from "./utils/visits";

type WaitUntil = { waitUntil(promise: Promise<unknown>): void };

// Counts page views after the page is sent, so visitors never wait on it.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  try {
    if (shouldCount(context.request, response, context.url)) {
      const counting = countVisit(context.request, context.url).catch((error) =>
        console.error("Visitor counter failed", error),
      );
      const cfContext = (context.locals as { cfContext?: WaitUntil }).cfContext;
      if (cfContext) cfContext.waitUntil(counting);
      else await counting;
    }
  } catch (error) {
    console.error("Visitor counter failed", error);
  }

  return response;
});
