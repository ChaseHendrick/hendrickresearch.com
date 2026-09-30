# Hendrick Research

A personal home for Chase Hendrick’s research and AI-assisted software, built for [www.hendrickresearch.com](https://www.hendrickresearch.com).

Warm ivory, copper, editorial typography, the original HR logo, and a numerically integrated Lorenz attractor. The portfolio presents nine projects and eight publicly archived research preprints. GENChase has a public descriptive catalog for its private research workspace; other projects link to available source code and live experiences. Papers link to PDFs and DOI records.

## Run locally

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The production site is generated in `dist/`. It is static: no database, API keys, or paid services are needed. The build renders the full portfolio and paper metadata into HTML so the content is available before JavaScript and to search engines. With JavaScript disabled, all project and paper links are visible.

## Add your work

Edit [`src/content.ts`](src/content.ts). Each project has its title, category, description, source, optional live link, and tags. Each paper has its exact title, short summary, DOI, PDF URL, and companion repository. The visible counts update automatically.

To host a new paper directly on this site:

1. Put the PDF in `public/papers/your-paper.pdf`.
2. Add an entry to `papers` with `pdf: '/papers/your-paper.pdf'`.
3. Commit and push. A connected Vercel project rebuilds from `main`.

To replace or add project art, edit [`src/artwork.ts`](src/artwork.ts). Current thumbnails are custom editorial illustrations rather than screenshots. The hero implements the classical Lorenz system with fourth-order Runge-Kutta integration. It illustrates the mathematics and does not present a new research result.

The full original logo is in `public/logo.png`. Browsers use a lossless WebP copy, 77% smaller, with identical visible pixels and alpha values; the original PNG remains the fallback. Fonts are served from the site itself, and hashed assets use long-lived browser caching. The site has project and paper topic filters, paper search, project dialogs, sticky navigation, keyboard controls, and reduced-motion support. Press `Alt+/` (Option+/ on Mac) to focus search. The hero stops animating while off-screen or while the tab is hidden.

## GENChase catalog

The `/genchase/` page organizes all 135 registered techniques, each corresponding to one studio tab, into topic groups. Visitors can search descriptions, tab names, implementation families, and preset names; combine topic and family filters; or switch to an alphabetical studio index. Each technique has a visibly labeled preset selector and sample preview. The workspace guide introduces its three areas and ten shared tools.

Edit [`src/genchase-data.json`](src/genchase-data.json) to refresh the descriptive snapshot. The current snapshot was checked against the registry on September 30, 2026 and includes 107 implementation families and 876 presets. Keep one entry per canonical technique ID. The build renders all entries into HTML, including when JavaScript is disabled. It does not fetch the private repository.

Publish only descriptive metadata intended for visitors. Do not copy source paths, code, private results, logs, or unpublished derivations into this file. Recorded evidence labels describe internal checks within their stated scope, not independent scientific validation. Repository visibility is managed separately on GitHub; this site omits GENChase repository and release links.

Preview images are actual locally rendered GENChase plates, captured through its registered presets. Motion previews are recorded clips with optional playback; the public site does not run or include the private scientific implementation. Previews are sample outputs, not numerical validation. Preserve the complete plate, preset identity, seed, source revision, and recipe version when refreshing them.

Put public media in `public/genchase/previews/`, using content-hashed filenames, and connect each file to its matching preset through the entry’s `previews` array. Safe provenance is recorded in `public/genchase-preview-manifest.json`. The current snapshot includes all 876 preset stills and seven recorded motion samples. Images load lazily, and recorded clips start only when played. The complete plate remains visible without cropping. Three registered presets produced nearly uniform samples at the recorded seed and are labeled accordingly.

## Browser games and the textile atlas

Four games run directly from `/play/fins/`, `/play/tinylaps/`, `/play/haywire/`, and `/play/sirens/`. Their completed browser builds live in `public/games/`, with each project's original license and dependency notices. No desktop installer is required. The wrappers provide controls, full screen, and a separate-tab option. After the Sirens requires a keyboard and mouse. Saved game progress stays in the visitor's browser.

TinyLaps includes 15 distinct circuits, corrected terrain depth rendering, a circuit chooser, compact mobile controls, and complete world restoration on restart. Haywire's island is enlarged to contain the barn and its roof.

`/fibers/` hosts the full Fibers of Earth atlas and its 2,585 static pages. Original sources, evidence limitations, MIT attribution, third-party notices, and safe provenance accompany the atlas. Refresh its complete static build for the `https://www.hendrickresearch.com/fibers/` base URL; keep the atlas's citations and reading pages intact.

## Search discovery

The build produces focused `/simulations/`, `/generative-art/`, and `/research/` pages plus a permanent `/genchase/<technique-id>/` page for each of the 135 techniques. These pages contain the actual text, links, preset galleries, and paper records in their initial HTML. JavaScript enhances preset selection, but reading does not depend on it.

Titles, descriptions, canonical URLs, social previews, and structured data are generated with each page. Actual motion clips include `VideoObject` metadata. The root `/sitemap.xml` is a sitemap index pointing to `/sitemap-site.xml` and `/fibers/sitemap.xml`. The main sitemap lists all main-site pages and all 876 preset images; the atlas supplies its full reading-page inventory. `robots.txt` advertises the root sitemap. Raw embedded game builds use `X-Robots-Tag: noindex` so their presentation pages are the search destinations.

Google Search Console domain ownership was verified through an additional Porkbun TXT record, and the stable root sitemap URL was submitted on September 30, 2026. Submission does not establish indexing or a search ranking. Its initial fetch report was pending with a `Couldn't fetch` result even though the public sitemap returned HTTP 200. Check the console's processing status after publication and allow Google time to crawl the expanded inventory.

## Vercel and the domain

Import `ChaseHendrick/hendrickresearch.com` in Vercel. It detects **Vite**. The included `vercel.json` specifies `npm run build` and `dist` as the output directory.

Add both `hendrickresearch.com` and `www.hendrickresearch.com` in the project’s **Settings → Domains**. Use `www` as the production address and redirect the apex to `www`. In Porkbun’s DNS editor, use the exact A/CNAME/TXT records Vercel shows for this project. Keep unrelated mail and verification records.

Official setup references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain), and [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Content provenance

Project destinations, manuscript titles, DOI records, PDFs, and the researcher’s ORCID were checked against the current public `ChaseHendrick` repositories on September 30, 2026. The papers are preprints and are labeled as not yet peer reviewed. No private drafts or personal exports are included.

The verified project records and original logo remain the authority for portfolio content and identity. This repository does not contain a browser-based upload administrator; publish updates through the content files and GitHub.
