# Au Better

The code behind **https://aubetter.org**, a pediatric health site for families and clinicians.

## What's in here

| Folder | What it is | Where it runs |
|---|---|---|
| `frontend/` | The website, built with [Astro](https://astro.build) | Cloudflare Workers (Worker name `pediatric`) |
| `studio/` | The content editor, built with [Sanity Studio](https://www.sanity.io/docs/sanity-studio) | https://aubetter.sanity.studio |

All content (pages, site settings) lives in Sanity: project `w0vz3r6z`, dataset `production`. The website reads it every time someone visits a page.

## How changes go live

- **Content:** edit and **Publish** in the Studio. It appears on the site within a few minutes; no code change is needed.
- **Website code:** merge a pull request into `main`. Cloudflare rebuilds and deploys automatically, in about a minute. If a build fails, the live site stays as it was.
- **Studio code** (anything in `studio/`): after merging, update the hosted Studio from the Mac:

  ```sh
  cd ~/Documents/pediatric && git pull && cd studio && npx sanity deploy
  ```

## Things to know before changing code

- **Packages:** Cloudflare installs packages with `npm clean-install`, which fails if `package.json` and `package-lock.json` disagree. Change packages with `npm install …` from the project folder so both files update together, and commit both.
- **Search engines:** pages ask search engines not to list them until **Site settings → "Show the site in search engines"** is turned on and published in the Studio. Pages served from any address other than aubetter.org are never listed.
- **One public address:** `frontend/wrangler.jsonc` turns off the `workers.dev` address on purpose. `aubetter.org` is connected in the Cloudflare dashboard (Workers & Pages → pediatric → Domains).
- **No secrets in this repository.** It's public. The one secret, `SANITY_API_READ_TOKEN`, is stored in Cloudflare, and it's only used when Visual Editing is on (never on the live site).

## Working on it locally

```sh
npm install      # once, from this folder
npm run dev      # website at http://localhost:4321, Studio at http://localhost:3333
```
