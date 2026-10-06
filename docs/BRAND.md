# Hendrick Research brand book

The reference for anyone, person or agent, adding a page, a component or a line of copy to hendrickresearch.com. The values below are the ones the CSS ships today (`src/style.css`, `src/appearance.css`, `src/research.css`). If the CSS changes, change this file in the same commit.

## What the brand is

Hendrick Research is one person's research and software, published openly. The site should feel like a well-kept research journal: warm paper, careful type, ruled lines, real figures. It should never feel like a product launch.

Three ideas carry it:

1. **Evidence first.** Every claim says how far it goes. Preprints are labelled as not peer reviewed. Unsolved things are called unsolved. A sample render is called a sample render.
2. **Made by hand.** Real renders, real data, real screenshots. Illustrations are drawn for the page. Nothing is stock, and nothing decorative pretends to be data.
3. **Quiet confidence.** Large serif headlines, generous space, small sans-serif text. The work is the loud part.

Tagline, used in footers only: *Research. Software. Possibility.*

## Name

- Full name: **Hendrick Research**. Short name (app manifest only): **Hendrick**.
- Person: **Chase Hendrick**, independent researcher, ORCID `0009-0002-9754-6087`, `chase@hendrickresearch.com`.
- Domain: `https://www.hendrickresearch.com`. `www` is canonical; the apex redirects to it.
- Write it as two words with capitals. Never "HR" in prose; "HR" is the monogram only.

## Logo

- Files: `public/logo.png` (original, 1536 by 1024), `public/logo.webp` (lossless copy, served first). Favicons: `public/favicon-hr.svg`, `favicon.svg`, the PNG sizes and `favicon.ico`.
- The logo is the stacked HR monogram over the HENDRICK RESEARCH wordmark. Do not redraw, recolor, outline, add effects or set the wordmark in another font.
- Header width: 142px on the home page, 140px on editorial pages, about 116 to 125px on phones.
- Dark mode: the image is turned light with `filter: brightness(0) invert(.9)`. Use that rule, not a second logo file.
- Clear space: at least the height of the R on every side. No logo on busy imagery.

## Color

Colors are CSS custom properties on `:root` and `html[data-theme="dark"]`. Write components against the tokens, never raw hex. The Appearance control sets `data-theme` for Light, Dark and System, and the early bootstrap applies it before first paint.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f7f5ef` | `#121314` | Page background |
| `--surface` | `#f0f0e7` | `#1a1c1e` | Panels, featured blocks, asides |
| `--field` | `#faf9f3` | `#17181a` | Inputs |
| `--soft` | `#e9ecdf` | `#24272a` | Hover fills |
| `--ink` | `#272b24` | `#ececec` | Text, primary buttons |
| `--ink-hover` | `#434a3c` | `#d6d8db` | Primary button hover |
| `--muted` | `#616c55` | `#a9adb2` | Secondary text, captions, notes |
| `--line` | `#dcded2` | `#2f3236` | Rules and borders |
| `--line-strong` | `#bbc2af` | `#4a4f55` | Input borders, outlined buttons |
| `--copper` | `#3d5a78` | `#9fb7d0` | The single accent: links on hover, italic headline words, focus rings |

`--copper` is a slate blue. The name is historical; keep it. There is one accent color. Do not add a second.

High contrast (`html[data-theme="dark"].a11y-contrast`) raises `--ink` to `#ffffff`, `--muted` to `#dcdfe2` and `--line` to `#80868d`.

The app manifest and `theme-color` use `#f7f5ef` (light) and `#121314` (dark).

### Charts and data

Charts use one blue family from the data-visualization reference palette, checked with its validator against the site's own surfaces.

| Role | Light | Dark |
| --- | --- | --- |
| Single-series bar (`--rs-bar`) | `#2a78d6` | `#3987e5` |
| Ordinal status, least to most settled (`--rs-s0` to `--rs-s4`) | `#6da7ec` `#3987e5` `#256abf` `#184f95` `#0d366b` | `#184f95` `#256abf` `#3987e5` `#6da7ec` `#9ec5f4` |
| Sequential heat (`--rs-h1` to `--rs-h6`) | `#cde2fb` to `#184f95` | `#0d366b` to `#9ec5f4` |

Rules: one hue for one measure; a 2px paper-colored gap between adjacent fills; 4px rounded data ends; values in ink, never in the series color; a legend whenever there are two or more series; a "Show the numbers as a table" view under every chart; a tooltip on every mark. Never two y-axes. Never a rainbow.

## Type

Two families, both self-hosted through `@fontsource` (no font CDN):

- **Instrument Serif**, 400 and 400 italic. Headlines, section titles, large numbers in figures. Italic for the one accented phrase in a headline, colored `--copper`.
- **DM Sans**, 400 and 500. Everything else.

| Element | Size | Notes |
| --- | --- | --- |
| Home hero `h1` | `clamp(70px, 6.8vw, 94px)` | line-height 1.04, letter-spacing -1.8px |
| Editorial `h1` | `clamp(50px, 6.5vw, 88px)` | 53px on phones |
| Section `h2` | 42 to 53px | line-height 1.12, ends with a period: "The cases." |
| Card and row `h3` | 27 to 32px serif | |
| Body | 13 to 15px | line-height 1.8 to 1.85, max width about 760px |
| Notes and captions | 11 to 12px, `--muted` | |
| Eyebrow | 10px, weight 500, uppercase, letter-spacing 1.65px | Slash-separated: `HISTORICAL CIPHER / PRE-PRINT STAGE` |

Weight 400 for headings. Never bold a serif. Never set body text in the serif.

## Layout

- Content width: `.wrap` is `min(1200px, 100% - 104px)`; on phones the side gutter is 20px.
- Structure comes from 1px rules (`--line`) between sections and rows, not from boxes and shadows. Drop shadows are kept to things that float: the Appearance control, the mobile menu, a dimmed game frame. Active tabs use an inset 1px `--copper` underline.
- Corners are square. The exceptions are pill filters and chips (30px radius), round icon buttons, and 3 to 4px on data marks.
- Sections: `editorial-section` with a top rule and 40px of vertical padding (30px on phones).
- Lists of things are ruled rows (`research-collection`, `paper-row`), each with an eyebrow, a serif title and one muted paragraph. Use a card grid only when each item has a real image.
- Breakpoints: 900px (two columns become one) and 650px (phone).
- No horizontal page scroll at 390px wide. Wide tables scroll inside `.rs-scroll`.

## Components

- **Text link** (`editorial-link`): label, then a small ↗, with a bottom rule. Hover turns it `--copper`.
- **Primary button** (`button-dark`, `rs-button`): ink fill, paper text, 12px weight 500, square.
- **Outline button** (`button-outline`): `--line-strong` border, muted text.
- **Filter chip** (`filter`, `rs-chip`): pill; pressed state is ink fill with paper text and `aria-pressed="true"`.
- **Eyebrow** above every title that needs context. One line, no icons.
- **Breadcrumbs** on every page below the top level: `Research / Undeciphered texts / D'Agapeyeff challenge`.
- **Editorial note** (`editorial-note`): the small muted paragraph that states limits. Every figure that could be over-read gets one.
- **Disclosure** (`details` and `summary`) for FAQs, inventories and table views, so pages stay short without hiding content from search.

## Imagery and motion

- The home hero is a Lorenz attractor integrated with fourth-order Runge-Kutta, drawn live. It is the one moving image. It stops when off screen, when the tab is hidden, and under reduced motion.
- GENChase images are actual preset renders; motion clips are recordings with controls, never autoplaying with sound.
- Project thumbnails are custom editorial illustrations (`src/artwork.ts`).
- Shader or generative effects are allowed only when they show the actual model a page is about (a vortex page may show the vortex). Never as decoration behind text.
- Respect `prefers-reduced-motion` everywhere. Transitions stay at 0.15 to 0.3 seconds.

## Voice and writing

Write the way a careful researcher explains their work to a smart friend.

- Plain sentences, mostly short. One idea per sentence.
- Say what was done and what it shows, then what it does not show. "No reading is claimed." "These are preprints and have not been peer reviewed."
- Numbers over adjectives: "28 of 34 ruled out", not "massive progress".
- British-neutral spelling is fine; be consistent within a page. Dates as "6 October 2026".
- Section titles are short statements ending in a period: "How progress is judged here."
- Second person sparingly ("Paste a paragraph"), first person plural for the research ("We plant a known message").
- Avoid em and en dashes in new copy; use a comma, a colon or a new sentence. Curly apostrophes are fine.

Words and habits to avoid: unlock, unleash, delve, elevate, seamless, cutting-edge, revolutionary, game-changing, journey, empower, "dive into", "in today's world", "it's not just X, it's Y", rhetorical questions as headings, exclamation marks, emoji, and triplets of adjectives.

## What makes a page look machine-made, and what we do instead

| Avoid | Do instead |
| --- | --- |
| Purple-to-blue gradients, glowing blobs, glassmorphism | Flat paper and surface colors with 1px rules |
| A grid of identical rounded cards with an icon on each | Ruled rows with an eyebrow, a serif title and one paragraph |
| A giant stat ("0%", "10x") as the hero of a section | A sentence that states the number and what it means |
| "How it works" in three or four numbered tiles | Two short paragraphs that explain the method |
| Pill badges on everything | One eyebrow line; chips only for real filters |
| Decorative shaders, particles, animated backgrounds | One meaningful figure, drawn from the real model or data |
| Stock photos and generated illustrations of "data" | Actual renders, screenshots and charts of the real numbers |
| Hype copy and slogans | Specific, scoped, numbered claims |
| Every number given a colored highlight | Ink-colored numbers; color only on data marks |
| Center-aligned everything | Left-aligned text on a strong left edge |

## Accessibility

- Text should meet WCAG AA contrast in both themes; check new color pairs before shipping. The high-contrast mode exists for readers who need more.
- Every interactive control is a real `button`, `a`, `input` or `select`, reachable by keyboard, with a visible focus ring (`2px solid var(--copper)`, offset 5px).
- Color is never the only signal: status bars have legends and counts, charts have tables, chips have pressed states.
- Pages work without JavaScript. Interactive modules enhance content that is already in the HTML.
- `forced-colors` gets bordered marks.

## Search and sharing

- Every page is prerendered: title, description, canonical URL, Open Graph and Twitter cards, and JSON-LD built by `pageHead` in `src/content-pages.ts`.
- Title pattern: `What it is: what the page answers | Hendrick Research`, using the name people search for ("D'Agapeyeff Cipher", not an internal label).
- Descriptions are one or two plain sentences that answer the query, under about 300 characters.
- Structured data matches the page: `ScholarlyArticle` for papers, `FAQPage` for explainer pages with real questions, `CollectionPage` with an `ItemList` for hubs, `BreadcrumbList` below the top level.
- New routes appear in `sitemap-site.xml` automatically when they are editorial pages. No ranking is promised; Search Console reports coverage.

## Checklist for a new page

1. Uses the editorial template and tokens; no new colors or fonts.
2. Has an eyebrow, a serif `h1`, one intro paragraph and breadcrumbs.
3. States its limits in an `editorial-note`.
4. Charts follow the chart rules and have table views.
5. Reads cleanly at 390px wide in both themes, with no horizontal scroll.
6. Works with JavaScript off.
7. Copy passes the voice rules above, and nothing on it would look at home on a template site.
