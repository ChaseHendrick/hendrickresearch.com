#!/usr/bin/env node
// Refreshes public/music/orograph/ with the Orograph web app.
//
//   node scripts/sync-orograph.mjs [path/to/synth]   build a synth checkout (default ../synth), then copy it
//   node scripts/sync-orograph.mjs --dist <folder>   copy a finished web build, such as an unzipped
//                                                    Orograph-web.zip from a synth release
//
// The synth checkout needs its own `npm ci` first. Nothing in the checkout is changed: the build goes to
// a temporary folder. The copy replaces public/music/orograph/ completely, then this site's canonical,
// social and WebApplication metadata is added to its index.html.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(site, 'public', 'music', 'orograph');
const origin = 'https://www.hendrickresearch.com';
const url = `${origin}/music/orograph/`;

const args = process.argv.slice(2);
const fail = message => { console.error(`sync-orograph: ${message}`); process.exit(1); };
const run = (command, commandArgs, cwd) => execFileSync(command, commandArgs, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], shell: process.platform === 'win32' });

let build;
let provenance = 'a prebuilt Orograph web build';
let temporary;
if (args[0] === '--dist') {
  if (!args[1]) fail('pass the folder that holds the built index.html after --dist');
  build = resolve(args[1]);
} else {
  const synth = resolve(args[0] ?? join(site, '..', 'synth'));
  if (!existsSync(join(synth, 'package.json'))) fail(`no synth checkout at ${synth}`);
  const version = JSON.parse(readFileSync(join(synth, 'package.json'), 'utf8')).version;
  let commit = 'unknown commit';
  try {
    commit = run('git', ['rev-parse', '--short', 'HEAD'], synth).trim();
    if (run('git', ['status', '--porcelain', '--untracked-files=no'], synth).trim()) commit += ' with uncommitted changes';
  } catch { /* not a git checkout */ }
  provenance = `Orograph ${version}, ChaseHendrick/synth ${commit}`;
  temporary = mkdtempSync(join(tmpdir(), 'orograph-web-'));
  build = temporary;
  console.log(`Building ${provenance} into ${build}`);
  execFileSync('npx', ['vite', 'build', '--outDir', build, '--emptyOutDir'], { cwd: synth, stdio: 'inherit', shell: process.platform === 'win32' });
}

// The app must load from a sub-path, so every reference has to be relative.
const files = [];
const walk = folder => {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) walk(path);
    else files.push(path);
  }
};
if (!existsSync(join(build, 'index.html')) || !existsSync(join(build, 'assets'))) fail(`${build} does not look like an Orograph web build (index.html and assets/ are missing)`);
walk(build);
const problems = [];
const html = readFileSync(join(build, 'index.html'), 'utf8');
for (const [, attribute, value] of html.matchAll(/\b(src|href)="([^"]*)"/g)) {
  if (value.startsWith('/')) problems.push(`index.html: ${attribute}="${value}" is root-absolute`);
  else if (/^\.\//.test(value) && !existsSync(join(build, value.split(/[?#]/)[0]))) problems.push(`index.html: ${value} is missing from the build`);
}
for (const path of files) {
  const name = relative(build, path);
  if (name.endsWith('.css')) for (const [found] of readFileSync(path, 'utf8').matchAll(/url\(\s*['"]?\/[^)]*\)/g)) problems.push(`${name}: ${found}`);
  if (name.endsWith('.js')) for (const [found] of readFileSync(path, 'utf8').matchAll(/["'`]\/(assets|icon|favicon|manifest)[^"'`]*["'`]/g)) problems.push(`${name}: ${found}`);
}
if (problems.length) fail(`the build has root-absolute paths that would break under /music/orograph/:\n  ${problems.join('\n  ')}`);

rmSync(target, { recursive: true, force: true });
cpSync(build, target, { recursive: true });
if (temporary) rmSync(temporary, { recursive: true, force: true });

const title = 'Orograph: a 3D wave terrain synthesizer in your browser';
const description = 'Place a glowing dot on a 3D landscape and play the shape of the land under its orbit. Free in your browser, with desktop apps for Mac, Windows and Linux.';
const image = `${origin}/music/orograph-social.jpg`;
const imageAlt = 'Orograph, a synthesizer you can walk across: a rendered ivory landscape with copper contour lines and an orbit looping past a glowing dot';
const escape = value => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Orograph',
  url,
  description,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web browser',
  browserRequirements: 'A modern browser with Web Audio and WebGL. Current Chrome or Edge for MIDI devices.',
  image,
  codeRepository: 'https://github.com/ChaseHendrick/synth',
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Chase Hendrick' },
};
const head = [
  `<!-- Added by hendrickresearch.com scripts/sync-orograph.mjs from ${escape(provenance)} -->`,
  `<link rel="canonical" href="${url}">`,
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="Hendrick Research">',
  `<meta property="og:title" content="${escape(title)}">`,
  `<meta property="og:description" content="${escape(description)}">`,
  `<meta property="og:url" content="${url}">`,
  `<meta property="og:image" content="${image}">`,
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  `<meta property="og:image:alt" content="${escape(imageAlt)}">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${escape(title)}">`,
  `<meta name="twitter:description" content="${escape(description)}">`,
  `<meta name="twitter:image" content="${image}">`,
  `<meta name="twitter:image:alt" content="${escape(imageAlt)}">`,
  `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
].map(line => `  ${line}\n`).join('');
const index = join(target, 'index.html');
let page = readFileSync(index, 'utf8');
if (!page.includes('</head>')) fail('the copied index.html has no </head>');
page = page.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(description)}">`)
  .replace('</head>', `${head}</head>`);
writeFileSync(index, page);

let bytes = 0;
const copied = [];
const measure = folder => {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) measure(path);
    else { bytes += statSync(path).size; copied.push(relative(target, path)); }
  }
};
measure(target);
console.log(`Copied ${copied.length} files (${(bytes / 1024 / 1024).toFixed(2)} MB) from ${provenance} to ${relative(site, target)}/`);
for (const name of copied.sort()) console.log(`  ${name}`);
