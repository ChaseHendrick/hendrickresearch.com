// Reports which parts of the site have fallen behind the repositories they are copied from.
//   node scripts/check-upstream.mjs [--out report.md]
// Exit code 0 always; the report says "All site sources are current." when nothing is behind.
// Run daily by .github/workflows/upstream-check.yml, which keeps one issue open while anything is stale.
//
// Checked: the paper list (src/papers-data.json) against the GENChase and Undeciphered-Texts registries,
// every paper PDF link, the cipher research ledgers (src/research-feed.json) against Undeciphered-Texts'
// research feed and against the site's editorial entries (src/cipher-research.ts), the GENChase technique
// catalog (src/genchase-data.json) against GENChase's techniques.json, and the Cipher Lab engine snapshot
// (public/cipher-lab/manifest.json) against its source repository.
// The paper list and the ledgers refresh themselves (sync-papers.yml); a research case with no editorial
// entry, the catalog and the Cipher Lab snapshot are updated by hand with the steps named in each finding.
import { readFileSync, writeFileSync } from 'node:fs';
import { REGISTRIES, released } from './sync-papers.mjs';
import { FEED, slim } from './sync-research.mjs';

const root = new URL('..', import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const token = process.env.GITHUB_TOKEN;
const get = async (url, json = true) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000), headers: token && url.includes('api.github.com') ? { authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return json ? res.json() : res;
};
const findings = [], errors = [];

async function papers() {
  const live = [];
  for (const source of REGISTRIES) live.push(...released(await get(source)));
  const site = read('src/papers-data.json');
  const siteDoi = Object.fromEntries(site.map(p => [p.id, p.doi]));
  const behind = live.filter(p => siteDoi[p.id] !== p.doi).map(p => p.id);
  if (behind.length) findings.push(`**Papers:** ${behind.join(', ')} differ from the paper registries. The sync workflow should fix this within six hours; if it does not, run it by hand (Actions > Sync papers and research ledgers > Run workflow).`);
  const broken = [];
  for (const p of site) {
    try { const r = await fetch(p.pdf, { method: 'HEAD', signal: AbortSignal.timeout(30000) }); if (!r.ok) broken.push(`${p.id} (HTTP ${r.status})`); }
    catch (e) { broken.push(`${p.id} (${e.message})`); }
  }
  if (broken.length) findings.push(`**Paper PDF links:** ${broken.join(', ')} do not resolve. Check the PDF path in GENChase's papers/papers.json and the companion repository.`);
}

async function research() {
  const upstream = slim(await get(FEED));
  const site = read('src/research-feed.json');
  if (JSON.stringify(site.cases) !== JSON.stringify(upstream.cases)) {
    const have = Object.fromEntries(site.cases.map(c => [c.id, c]));
    const moved = upstream.cases.filter(c => JSON.stringify(have[c.id]) !== JSON.stringify(c)).map(c => `${c.id} (reviewed through ${c.reviewed_through})`);
    findings.push(`**Research ledgers:** ${moved.join(', ')} differ from Undeciphered-Texts' research feed. The sync workflow should fix this within six hours; if it does not, run it by hand.`);
  }
  const editorial = readFileSync(new URL('src/cipher-research.ts', root), 'utf8');
  const missing = upstream.cases.filter(c => !editorial.includes(`id: '${c.id}'`)).map(c => c.id);
  if (missing.length) findings.push(`**Research notes:** ${missing.join(', ')} ${missing.length > 1 ? 'have' : 'has'} a ledger but no editorial entry in src/cipher-research.ts. Write one from its note in Undeciphered-Texts/docs/research-notes; until then the Cipher Lab page shows only the ledger line.`);
}

async function catalog() {
  const upstream = await get('https://raw.githubusercontent.com/ChaseHendrick/GENChase/main/techniques.json');
  const want = new Set(upstream.techniques.map(t => t.id));
  const snap = read('src/genchase-data.json');
  const have = new Set(snap.entries.map(e => e.id));
  const added = [...want].filter(id => !have.has(id)), removed = [...have].filter(id => !want.has(id));
  if (added.length || removed.length) findings.push(`**GENChase catalog** (snapshot ${snap.snapshotDate}): GENChase has ${want.size} techniques, the site ${have.size}.${added.length ? ` New: ${added.join(', ')}.` : ''}${removed.length ? ` Removed: ${removed.join(', ')}.` : ''} Regenerate src/genchase-data.json and its previews from GENChase.`);
}

async function cipherLab() {
  const m = read('public/cipher-lab/manifest.json');
  const repo = m.source_repository.replace('https://github.com/', '');
  const cmp = await get(`https://api.github.com/repos/${repo}/compare/${m.source_git_commit}...HEAD`);
  if (!cmp.ahead_by) return;
  const shipped = new Set((m.files || []).map(f => (typeof f === 'string' ? f : f.path)).filter(Boolean));
  const touched = (cmp.files || []).map(f => f.filename).filter(f => shipped.size === 0 || shipped.has(f));
  if (touched.length) findings.push(`**Cipher Lab engine:** ${repo} is ${cmp.ahead_by} commit(s) past the shipped snapshot ${m.source_git_commit.slice(0, 7)}, and ${touched.length} shipped file(s) changed (${touched.slice(0, 8).join(', ')}${touched.length > 8 ? ', ...' : ''}). Rebuild with \`python scripts/sync-cipher-lab.py --source <checkout>\`.`);
}

for (const [name, check] of [['papers', papers], ['research', research], ['catalog', catalog], ['cipher lab', cipherLab]]) {
  try { await check(); } catch (e) { errors.push(`${name}: ${e.message}`); }
}
const report = [
  findings.length ? '## Site sources behind their upstream repositories\n\n' + findings.map(f => `- ${f}`).join('\n') : 'All site sources are current.',
  errors.length ? '\n\n## Checks that could not run\n\n' + errors.map(e => `- ${e}`).join('\n') : '',
  '\n\nThe Oro web app (public/music/oro/) carries no source version, so it is not checked; refresh it with `node scripts/sync-orograph.mjs` after a synth release.',
].join('');
const out = process.argv.indexOf('--out');
if (out > 0) writeFileSync(process.argv[out + 1], report + '\n');
console.log(report);
console.log(`STALE=${findings.length ? 1 : 0}`);
