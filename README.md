# Oktant Docs

Documentation for [Oktant](https://github.com/oktanthq): Build. Deploy. Observe.

Built with [Astro Starlight](https://starlight.astro.build). Pages live in `src/content/docs/`.

## Develop

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

## Deploy

The site is fully static. Any static host works:

- **Cloudflare Pages / Netlify / Vercel:** build command `npm run build`, output directory `dist`, Node 20+.
- **GitHub Pages:** upload `dist/` from a workflow after `npm run build`.

`site` in `astro.config.mjs` is set to `https://docs.oktant.tech`. Change it if the docs are served from another domain, since it is used for the sitemap and canonical URLs.

## Writing pages

- Add Markdown or MDX files under `src/content/docs/`. The file path becomes the URL.
- Sidebar groups for `getting-started/`, `components/`, and `reference/` are generated from their folders; use `sidebar.order` in frontmatter to sort.
- Content is drawn from each repository's README and `docs/` folder. When those change, update the matching page here.
- Keep [What is built](src/content/docs/status.md) accurate. Do not document planned features as working.
