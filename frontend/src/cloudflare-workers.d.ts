// Minimal types for the Workers runtime module, so `astro check` passes without
// a generated worker-configuration.d.ts. If you later run `wrangler types`,
// delete this file and use the generated types instead.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
