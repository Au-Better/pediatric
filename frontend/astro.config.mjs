// Loading environment variables from .env files
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
import { loadEnv } from "vite";
const { PUBLIC_SANITY_STUDIO_URL } = loadEnv(import.meta.env.MODE, process.cwd(), "");
import { defineConfig } from "astro/config";

// Written in directly (not read from .env or Cloudflare settings) so every build uses
// the same Sanity project. These values are public.
const projectId = "w0vz3r6z";
const dataset = "production";
const studioUrl = PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";

import sanity from "@sanity/astro";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // The site's main address. Pages use it to tell search engines their one true address.
  site: "https://aubetter.org",

  // Pages are built on Cloudflare at each visit, so published Sanity changes show up without a rebuild.
  // The Cloudflare adapter at the bottom of this file makes that work.
  output: "server",

  integrations: [
    sanity({
      projectId,
      dataset,
      // studioBasePath: "/admin",
      // Set useCdn to false if you're building statically.
      useCdn: false,
      apiVersion: "2026-03-26", // Set to date of setup to use the latest API version
      stega: {
        studioUrl,
      },
    }),
    react(), // Required for Sanity Studio
  ],

  vite: {
    optimizeDeps: {
      include: [
        "react/compiler-runtime",
        "lodash/isObject.js",
        "lodash/groupBy.js",
        "lodash/keyBy.js",
        "lodash/partition.js",
        "lodash/sortedIndex.js",
      ],
    },

    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});