// Local artifact checks, not a claim of Google indexing or search ranking.
// Usage: node scripts/test-cipher-lab-seo.mjs [--dist path] [--base-url http://127.0.0.1:4173]
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://www.hendrickresearch.com';
const canonical = `${origin}/cipher-lab/`;
let dist = resolve(root, 'dist');
let baseURL;
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  const value = process.argv[++i];
  assert(value && ['--dist', '--base-url'].includes(flag), 'Use --dist path or --base-url URL');
  if (flag === '--dist') dist = resolve(value);
  else baseURL = new URL(value);
}
const read = path => readFileSync(path, 'utf8');
const decode = value => value.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) =>
  String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
  .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, code) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[code]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4])]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => attributes(match[0]));
const text = html => decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const bodyOf = html => html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
const navigation = html => [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)]
  .map(match => ({ attributes: attributes(match[1]), html: match[2] }));
const labLink = html => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].some(match => {
  const href = attributes(match[1]).href;
  return href && new URL(href, origin).href === canonical && /Cipher\s+Lab/i.test(text(match[2]));
});
const builtPage = route => resolve(dist, `.${route}`, 'index.html');
assert(existsSync(builtPage('/cipher-lab/')), 'Missing built Cipher Lab page: run npm run build after adding the route');
const html = read(builtPage('/cipher-lab/'));
const body = bodyOf(html);
const visible = text(body);
assert(visible.length >= 300, 'Cipher Lab must have useful initial HTML content, not an empty app shell');
assert(/<html\b[^>]*\blang=["']en["']/i.test(html), 'Set the document language');
const headings = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
assert.equal(headings.length, 1, 'Use one descriptive page heading');
assert(/Cipher\s+Lab/i.test(text(headings[0][1])), 'The page heading must identify Cipher Lab');
assert(/candidate|hypothes|supplied.key|known.key|bounded/i.test(visible), 'Explain the actual search or supplied-key scope');
assert(/independent|verification|unverified/i.test(visible), 'Keep independent verification visible before JavaScript runs');
assert(/<section\b[^>]*\bid=["']cipher-research["']/i.test(body), 'Research notes must be present in the initial HTML');
const research = body.match(/<section\b[^>]*\bid=["']cipher-research["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
const researchText = text(research);
for (const topic of [/Voynich/i, /Linear A/i, /Indus/i, /Kryptos/i, /Agapeyeff/i]) {
  assert(topic.test(researchText), `Missing researched topic in crawlable HTML: ${topic}`);
}
assert((research.match(/<details\b[^>]*\bclass=["'][^"']*\bcipher-research-entry\b/gi) ?? []).length >= 6, 'Keep at least six substantive research entries');
assert(tags(research, 'time').some(tag => tag.datetime === '2026-10-03') && /October 2026/.test(researchText), 'Show the actual research review date');
assert(/A-Z|Latin|glyph/i.test(researchText), 'Explain the script support boundary alongside the notes');
assert((research.match(/class=["']cipher-tally["']/g) ?? []).length >= 9 && /Ledger, reviewed through/.test(researchText),
  'Each research entry must carry its synced ledger tally in the initial HTML');
assert(/no reading|not a reading|No reading/i.test(researchText), 'State that no case is a reading');
const researchReferences = tags(research, 'a').filter(tag => tag.href?.startsWith('https://'));
assert(researchReferences.length >= 6, 'Keep primary source references crawlable with ordinary HTTPS links');
assert(researchReferences.some(tag => tag.href === 'https://www.paradigm.xyz/writing/kryptos')
  && /Paradigm/.test(researchText) && /June 2026/.test(researchText),
  'The dated K4 review must include the current custodian\'s first-party 2026 update');
const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
assert.equal(titles.length, 1, 'Use one initial HTML title');
const title = text(titles[0][1]);
assert(/Cipher\s+Lab/i.test(title) && /Hendrick Research/i.test(title), 'Use a distinct, descriptive Cipher Lab title');
const meta = tags(html, 'meta');
const descriptions = meta.filter(tag => tag.name?.toLowerCase() === 'description');
assert.equal(descriptions.length, 1, 'Use one initial meta description');
assert(descriptions[0].content?.length >= 40, 'The description must explain this application');
assert(meta.some(tag => tag.name === 'viewport'), 'Keep the mobile viewport declaration');
for (const tag of meta.filter(tag => /^(robots|googlebot)$/i.test(tag.name ?? ''))) {
  assert(!/noindex|nofollow|none/i.test(tag.content ?? ''), 'Do not block the application in robots metadata');
}
const canonicals = tags(html, 'link').filter(tag => /\bcanonical\b/i.test(tag.rel ?? ''));
assert.equal(canonicals.length, 1, 'Use one initial canonical link');
assert.equal(canonicals[0].href, canonical, 'The canonical must identify the published slash route');
assert.equal(meta.find(tag => tag.property === 'og:url')?.content, canonical, 'Open Graph URL must agree with the canonical');
assert.equal(meta.find(tag => tag.property === 'og:title')?.content, title, 'Open Graph title must agree with the page title');
assert(meta.some(tag => tag.name === 'twitter:card'), 'Include a social card declaration');

const schema = [];
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value)) schema.push(value);
  for (const child of Object.values(value)) collect(child);
}
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (attributes(match[1]).type === 'application/ld+json') collect(JSON.parse(match[2]));
}
const hasType = (node, type) => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).includes(type);
const apps = schema.filter(node => hasType(node, 'WebApplication'));
assert.equal(apps.length, 1, 'Describe the actual workbench with one WebApplication');
assert(/Cipher\s+Lab/i.test(apps[0].name ?? ''), 'Application name must match the visible product');
assert.equal(apps[0].url, canonical, 'Application URL must match the canonical');
assert(apps[0].applicationCategory && apps[0].operatingSystem, 'Declare the application category and supported environment');
for (const node of schema) {
  assert(!('aggregateRating' in node) && !('review' in node) && !hasType(node, 'AggregateRating'), 'Do not invent ratings or reviews');
  for (const value of Object.values(node).filter(value => typeof value === 'string')) {
    assert(!/\b(?:solves?|deciphers?)\s+(?:all|any|every)\s+(?:unsolved|undeciphered|ancient)/i.test(value), 'Do not advertise unrestricted decipherment');
  }
}
const trails = schema.filter(node => hasType(node, 'BreadcrumbList'));
assert.equal(trails.length, 1, 'Provide one truthful breadcrumb trail');
const trail = trails[0].itemListElement;
assert(Array.isArray(trail) && trail.length >= 2, 'Breadcrumb trail needs home and the application');
trail.forEach((item, index) => {
  assert(hasType(item, 'ListItem') && item.position === index + 1 && item.name, 'Breadcrumb positions and names must be valid');
  if (item.item) assert(new URL(typeof item.item === 'string' ? item.item : item.item['@id']).origin === origin, 'Breadcrumb links must use the main public origin');
});
assert.equal(typeof trail[0].item === 'string' ? trail[0].item : trail[0].item?.['@id'], `${origin}/`);
assert(/Cipher\s+Lab/i.test(trail.at(-1).name), 'Last breadcrumb must name this page');
if (trail.at(-1).item) assert.equal(typeof trail.at(-1).item === 'string' ? trail.at(-1).item : trail.at(-1).item['@id'], canonical);

const routes = ['/', '/games/', '/music/', '/genchase/', '/generative-art/', '/research/', '/simulations/', '/sieges/', '/fibers/', '/play/siegeworks/', '/cipher-lab/'];
for (const route of routes) {
  assert(existsSync(builtPage(route)), `Missing major built route: ${route}`);
  assert(navigation(read(builtPage(route))).some(nav => labLink(nav.html)), `No crawlable Cipher Lab navigation link on ${route}`);
}
const home = read(builtPage('/'));
for (const className of ['desktop-nav', 'mobile-nav']) {
  assert(navigation(home).some(nav => nav.attributes.class?.split(/\s+/).includes(className) && labLink(nav.html)), `Homepage ${className} must link to Cipher Lab`);
}
assert.notEqual(text(home.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ''), title, 'Application and homepage need distinct titles');
assert(!html.includes('<!--cipher-lab'), 'No unfinished prerender markers');
for (const asset of [...tags(html, 'script').map(tag => tag.src), ...tags(html, 'link').map(tag => tag.href)].filter(Boolean)) {
  const url = new URL(asset, origin);
  if (url.origin === origin && url.pathname.startsWith('/assets/')) assert(existsSync(resolve(dist, `.${url.pathname}`)), `Missing built asset: ${asset}`);
}
const sitemap = read(resolve(dist, 'sitemap.xml'));
assert(sitemap.includes(`<loc>${origin}/sitemap-site.xml</loc>`), 'Sitemap index must link to the site route sitemap');
const siteMap = read(resolve(dist, 'sitemap-site.xml'));
assert.equal((siteMap.match(new RegExp(`<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`, 'g')) ?? []).length, 1, 'Site sitemap must include the canonical application exactly once');
const robots = read(resolve(dist, 'robots.txt'));
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'Robots must point to the main sitemap');
assert(!/^\s*Disallow:\s*(?:\/\s*$|\/cipher-lab(?:\/|\s*$))/mi.test(robots), 'Do not disallow the Cipher Lab route');
const deployment = JSON.parse(read(resolve(root, 'vercel.json')));
assert(!(deployment.rewrites ?? []).some(rule => ['/', '/index.html', '/cipher-lab/', '/cipher-lab/index.html'].includes(rule.destination) && /\(\.\*\)|:path\*/.test(rule.source)), 'Do not mask missing routes with an application/homepage catch-all');

if (baseURL) {
  const page = await fetch(new URL('/cipher-lab/', baseURL), { signal: AbortSignal.timeout(8000) });
  assert.equal(page.status, 200, 'The application route must respond successfully');
  assert(!/noindex/i.test(page.headers.get('x-robots-tag') ?? ''), 'An HTTP header must not block application indexing');
  const served = await page.text();
  assert(served.includes(canonical) && /Cipher\s+Lab/i.test(text(bodyOf(served))), 'HTTP response must contain the prerendered application');
  const missing = await fetch(new URL('/cipher-lab/__seo_missing_route__/', baseURL), { redirect: 'manual', signal: AbortSignal.timeout(8000) });
  assert.equal(missing.status, 404, 'An unknown route must return an honest HTTP 404');
  console.log('Cipher Lab SEO: static content, metadata, schema, 11 major nav routes, assets, sitemaps, robots and HTTP/404 checks passed.');
} else {
  console.log('Cipher Lab SEO: static content, metadata, schema, 11 major nav routes, assets, sitemaps and robots passed. HTTP/404 checks not run; pass --base-url for a local preview.');
}
