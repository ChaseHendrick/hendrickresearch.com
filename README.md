# Hendrick Research

A personal home for Chase Hendrick’s research and AI-assisted software, built for [hendrickresearch.com](https://hendrickresearch.com).

Warm ivory, copper, editorial typography, the original HR logo, and a numerically integrated Lorenz attractor. The portfolio includes nine public projects and eight publicly archived research preprints, with links to source code, live experiences, PDFs, and DOI records.

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

The production site is generated in `dist/`. It is static: no database, API keys, or paid services are needed.

## Add your work

Edit [`src/content.ts`](src/content.ts). Each project has its title, category, description, source, optional live link, and tags. Each paper has its exact title, short summary, DOI, PDF URL, and companion repository. The visible counts update automatically.

To host a new paper directly on this site:

1. Put the PDF in `public/papers/your-paper.pdf`.
2. Add an entry to `papers` with `pdf: '/papers/your-paper.pdf'`.
3. Commit and push. A connected Vercel project rebuilds from `main`.

To replace or add project art, edit [`src/artwork.ts`](src/artwork.ts). Current thumbnails are custom editorial illustrations rather than screenshots. The hero implements the classical Lorenz system with fourth-order Runge-Kutta integration. It illustrates the mathematics and does not present a new research result.

The full original logo is in `public/logo.png`. Fonts are served from the site itself. The site has category filters, project dialogs, mobile navigation, keyboard controls, and reduced-motion support. The hero stops animating while off-screen or while the tab is hidden.

## Vercel and the domain

Import `ChaseHendrick/hendrickresearch.com` in Vercel. It detects **Vite**. The included `vercel.json` specifies `npm run build` and `dist` as the output directory.

Add both `hendrickresearch.com` and `www.hendrickresearch.com` in the project’s **Settings → Domains**. Use the apex domain as the production address and redirect `www` to the apex. In Porkbun’s DNS editor, use the exact A/CNAME/TXT records Vercel shows for this project. Keep unrelated mail and verification records.

Official setup references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain), and [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Content provenance

Project destinations, manuscript titles, DOI records, PDFs, and the researcher’s ORCID were checked against the current public `ChaseHendrick` repositories on September 30, 2026. The papers are preprints and are labeled as not yet peer reviewed. No private drafts or personal exports are included.

Public GitHub source and the original logo remain the authority for portfolio content and identity. This repository does not contain a browser-based upload administrator; publish updates through the content file and GitHub.
