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

## Music and MPC Studio

The Music navigation opens `/music/`, a page for Orograph (below) and for MPC Studio's native Apple Silicon Mac app and Windows browser studio. The native app starts with ambient soundscapes and selects on-device Apple Intelligence when available, or the offline music engine otherwise. It supports USB-C MIDI playback, evolving loops, performance pads, mapped CC controls, and MIDI export, and requires macOS 26 or later. An optional OpenAI-compatible connection supports user-configured local model servers and HTTPS cloud providers. The CPU renders MIDI arrangements and schedules playback; a local model server controls its own GPU offload or MLX execution. These engines design note arrangements, not neural waveform audio. Apple on-device inference and MIDI rendering have been tested on the development Mac. Physical MPC playback and optional model-provider connections still need end-to-end validation, separate from protocol fixtures.

`public/music/studio/` holds the standalone browser app copied from the [canonical studio source](https://github.com/ChaseHendrick/music-field-manual/tree/main/studio). It is served at `/music/studio/` without a Vite entry point. Windows users need current Chrome or Edge, HTTPS and explicit MIDI permission for hardware access. Its offline generation runs on the browser CPU. Optional model-server connections also need CORS and, for localhost, applicable local-network permission. Its HTML carries its own canonical, Open Graph, Twitter and WebApplication metadata, and the route is included in the site sitemap. Apple Foundation Models remains native Mac only.

The page is rendered by `src/music.ts`, styled in `src/music.css`, and enhanced by `src/music-main.ts`. Its initial HTML includes the setup, canonical/social metadata, and SoftwareApplication schema; the page and native screenshot appear in the main sitemap. The site does not run the native app in the browser.

To refresh the download, copy a verified `MPC-Studio-macOS.zip` from the [canonical native app source](https://github.com/ChaseHendrick/music-field-manual/tree/main/native/MPCStudio) into `public/downloads/`. Copy its actual native screenshot to `public/music/mpc-studio.png`. The current download is locally signed rather than Developer ID signed or notarized; first-launch instructions are visible on the page. Preserve the app's README and PolyForm Small Business license inside the bundle.

### Orograph

The Music page opens with Orograph, a 3D wave terrain synthesizer: a closed orbit circles a dot placed on a 3D landscape, and the height of the ground under that orbit becomes the waveform. The section links to the browser version at `/music/orograph/`, the [latest release](https://github.com/ChaseHendrick/synth/releases/latest), and the [canonical Orograph source](https://github.com/ChaseHendrick/synth). Direct download links use the release asset names set by `build.*.artifactName` in the synth repository's `package.json` and by its release workflow: `Orograph-mac-arm64.dmg`, `Orograph-mac-x64.dmg`, `Orograph-windows-setup.exe`, `Orograph-windows-portable.exe`, `Orograph-linux-x86_64.AppImage`, and the one-file offline `Orograph.html`. They are listed once in `orographFiles` in `src/music.ts`; keep them in step if the packaging changes. Feature counts on the page (13 terrains, 12 orbit shapes, four parts, 53 presets, seven demo songs) were checked against the synth source on October 2, 2026.

`public/music/orograph/` holds the Vite web build of the synth repository. It is served at `/music/orograph/` without a Vite entry point. The build uses relative asset paths (`base: './'`), so it works under this sub-path, and its content-hashed files in `assets/` get long-lived immutable caching from `vercel.json`. The app follows this site's saved Appearance setting until the player picks a theme inside Orograph. Sound works in any modern browser with Web Audio and WebGL; MIDI devices need current Chrome or Edge.

To refresh it, run `npm ci` in a synth checkout, then from this repository:

```sh
node scripts/sync-orograph.mjs ../synth
```

The script builds Orograph into a temporary folder without changing the checkout, stops if the build has root-absolute asset paths, replaces `public/music/orograph/` completely, and adds this site's title, canonical URL, Open Graph, Twitter and WebApplication metadata to the copied `index.html`, with a comment naming the synth version and commit. To publish a finished release instead, unzip its `Orograph-web.zip` and run `node scripts/sync-orograph.mjs --dist path/to/unzipped`. Do not edit files in `public/music/orograph/` by hand; change the synth repository and sync again. The current copy was built from synth commit `8407235` with uncommitted work in progress, so refresh it once the app is final.

`public/music/orograph-hero-light.jpg` and `orograph-hero-dark.jpg` (1920 × 1080) are Blender renders of Orograph's own Swell and Massif terrains with a rose orbit, exported from the synth's terrain code. The page shows the one that matches the current appearance, and only that one loads. `orograph-social.jpg` (1200 × 630) is the social preview for `/music/` and `/music/orograph/` and the image in the Orograph structured data. The hero images and the MPC Studio screenshot appear in the main sitemap.

Orograph is an independent, clean-room implementation of wave terrain synthesis, written from first principles and published mathematics. No code, graphics, sounds or presets from any other product were used. It is not affiliated with, endorsed by, or connected to Conductive Labs; Terrain Synth is their trademark. Keep that note visible on the page. Orograph is MIT licensed, and its release builds are not signed with a paid Apple or Microsoft certificate, so the page explains the first-launch confirmation.

## Browser games and the textile atlas

Five games run directly from `/play/fins/`, `/play/tinylaps/`, `/play/haywire/`, `/play/sirens/`, and `/play/siegeworks/`. Their completed browser builds live in `public/games/`, with each project's original license and dependency notices. No desktop installer is required. The wrappers provide controls, full screen, and a separate-tab option. After the Sirens requires a keyboard and mouse. Saved game progress stays in the visitor's browser.

TinyLaps includes 15 distinct circuits, corrected terrain depth rendering, a circuit chooser, compact mobile controls, complete world restoration on restart, 36 residents in circuit villages and 108 in each city, with family routines and reactions to god powers, and a visible grab control for cars, adult pedestrians, buildings, trees, and landmarks. Throws cause collision and landing damage; adult ragdolls recover. Children remain uninjured town life. Moved scenery and residents are included in persistent browser saves. Haywire's island is enlarged to contain the barn and its roof.

`/fibers/` hosts the full Fibers of Earth atlas and its 2,585 static pages. Original sources, evidence limitations, MIT attribution, third-party notices, and safe provenance accompany the atlas. Refresh its complete static build for the `https://www.hendrickresearch.com/fibers/` base URL; keep the atlas's citations and reading pages intact.

## Search discovery

The build produces focused `/simulations/`, `/generative-art/`, and `/research/` pages plus a permanent `/genchase/<technique-id>/` page for each of the 135 techniques. These pages contain the actual text, links, preset galleries, and paper records in their initial HTML. JavaScript enhances preset selection, but reading does not depend on it.

Titles, descriptions, canonical URLs, social previews, and structured data are generated with each page. Actual motion clips include `VideoObject` metadata. The root `/sitemap.xml` is a sitemap index pointing to `/sitemap-site.xml` and `/fibers/sitemap.xml`. The main sitemap lists all main-site pages and all 876 preset images; the atlas supplies its full reading-page inventory. `robots.txt` advertises the root sitemap. Raw embedded game builds use `X-Robots-Tag: noindex` so their presentation pages are the search destinations.

Google Search Console domain ownership was verified through an additional Porkbun TXT record. The published root sitemap index was submitted on September 30, 2026, and Google reports **Success**. Sitemap processing does not establish that every page is indexed or determine a search ranking. Allow Google time to crawl the expanded inventory and assess coverage in Search Console.

## Vercel and the domain

Import `ChaseHendrick/hendrickresearch.com` in Vercel. It detects **Vite**. The included `vercel.json` specifies `npm run build` and `dist` as the output directory.

Add both `hendrickresearch.com` and `www.hendrickresearch.com` in the project’s **Settings → Domains**. Use `www` as the production address and redirect the apex to `www`. In Porkbun’s DNS editor, use the exact A/CNAME/TXT records Vercel shows for this project. Keep unrelated mail and verification records.

Official setup references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain), and [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Content provenance

Project destinations, manuscript titles, DOI records, PDFs, and the researcher’s ORCID were checked against the current public `ChaseHendrick` repositories on September 30, 2026. The papers are preprints and are labeled as not yet peer reviewed. No private drafts or personal exports are included.

The verified project records and original logo remain the authority for portfolio content and identity. This repository does not contain a browser-based upload administrator; publish updates through the content files and GitHub.

## Games

The Games navigation opens `/games/`, with After the Sirens hosted directly at `/games/after-the-sirens/`. The verified 0.5 release includes 3,455 original items, 4,457 crafting/salvage recipes, catalogue pagination and filters, and independently saved music, effects and ambience controls. Other game cards link to their existing playable projects or source. The game uses its own Singleplayer and Multiplayer menu. Shared worlds run locally on a host computer through Node.js, with up to 20 connected players, public server browsing and private invite codes. The static website does not simulate worlds. Its initial public catalogue is empty until real hosts are submitted; dynamic directories are separate services. See the [multiplayer hosting guide](https://github.com/ChaseHendrick/After-the-Sirens/blob/main/docs/MULTIPLAYER.md).

To update the locally hosted game, copy the verified standalone `index.html` from an After the Sirens release into `public/games/after-the-sirens/index.html` and its original gameplay screenshot into `gameplay.png`. Keep the upstream MIT license alongside it. The game HTML contains its code, artwork, styles and procedural sound, so it needs no external assets at runtime.

## Appearance and play

The Appearance control offers Light, Dark, and System settings. A saved preference applies across the portfolio, GENChase, every technique page, and the full Fibers of Earth atlas. The early theme bootstrap avoids a flash of the other theme.

All five play pages offer Dim surroundings and Full screen. Dim mode keeps the existing game frame alive, supports background-click, Escape, and explicit button exits, and restores keyboard focus on exit. Entering or leaving either view preserves the running game.

Game saves stay on this origin in the same browser. Fin’s offers Continue and multiple save slots; Haywire restores its expedition automatically. TinyLaps saves its current circuit, race, car damage, terrain edits, scenery, barriers, camera, and controls every 2.5 seconds and on page exit. After the Sirens offers Continue saved run; the current game saves every five seconds and on page exit. Its multiplayer world and survivor packs are saved separately on the host computer.

Verified in isolated Chrome: theme persistence and device-theme changes, cross-tab settings, mobile layouts at 320 and 390 pixels, all dim/fullscreen exit paths, zero game-frame reloads during view changes, and close/reopen save restoration in all four games. TinyLaps also checks snapshot round trips, malformed saves, and unavailable storage alongside its physics, models, terrain, and scenery tests.

## Siegeworks

The Sieges navigation tab opens `/play/siegeworks/`, a collection of six original historical miniatures: Masada, Alesia, Jerusalem, Tyre, Constantinople, and Candia. Crews load supplies, haul material, and build the ramp, causeway, defenses, batteries, or trench approach. Articulated figures, wheels, work tools, dust, banners, boats, and projectiles are animated. cannon-es provides gravity, collision bodies, pickup constraints, physical throwing, projectiles, and recovery; engine motion remains controlled. The compact camera toolbar uses one row.

Each siege saves separately in the current browser. Historical notes include primary and institutional sources, and distinguish archaeological remains from the model’s schematic geometry and compressed timing. Canonical source and CI are in the public [Siegeworks repository](https://github.com/ChaseHendrick/Siegeworks). The self-contained hosted file includes its dependency notices. Copy `index.html` and `LICENSE.txt` from a verified canonical build into `public/games/siegeworks/` before building this site.

The search index includes a historical siege collection and six source-backed field guides, each with a unique title, description, canonical URL, structured data, social preview, and sitemap image. TinyLaps also includes three connected city districts and conservative shallow-channel water with currents and buoyancy.

After the Sirens has a static `/after-the-sirens/` game guide, a dedicated browser zombie survival title on its playable wrapper, an indexable original gameplay image, and VideoGame/WebApplication structured data. The guide links to accurate singleplayer, items, and self-hosted multiplayer documentation without modifying the game build.

Every indexable page has a title, description, canonical URL, social preview, and structured data. Atlas exports gain breadcrumb markup and complete social metadata at build time; distinct same-name Wikidata records retain their record IDs in metadata. The offline copy and raw game bundles stay out of search indexing. Sitemap coverage is validated against the full built site.

Each GENChase technique page has an independent public art sketch playground with text seeds, density/scale/complexity sliders, palettes, saved recipes, share links, vector SVG and 3200 × 2240 PNG downloads, and a dedicated print/PDF view. These illustrations are separate from native recorded samples and import no research engine code. Production bundles and embedded game JavaScript are minified without source maps; browser-delivered code remains downloadable, and upstream public source repositories remain public.
