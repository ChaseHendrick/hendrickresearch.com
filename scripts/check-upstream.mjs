// Reports which parts of the site have fallen behind the repositories they are copied from.
//   node scripts/check-upstream.mjs [--out report.md]
// Exit code 0 always; the report says "All site sources are current." when nothing is behind.
// Run daily by .github/workflows/upstream-check.yml, which keeps one issue open while anything is stale.
//
// Checked: the paper list (src/papers-data.json) against GENChase's registry, every paper PDF link,
// the GENChase technique catalog (src/genchase-data.json) against GENChase's techniques.json, and the
// Cipher Lab engine snapshot (public/cipher-lab/manifest.json) against its source repository.
// The paper list refreshes itself (sync-papers.yml); the catalog and Cipher Lab snapshots carry preview
// images and a packaged engine, so they are rebuilt by hand with the steps named in each finding.
import { readFileSync, writeFileSync } from 'node:fs';

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
  const registry = await get('https://raw.githubusercontent.com/ChaseHendrick/GENChase/main/papers/papers.json');
  const live = registry.papers.filter(p => ['ready', 'on-arxiv', 'submitted', 'accepted', 'published'].includes(p.status) && p.companion && p.codeDoi);
  const site = read('src/papers-data.json');
  const siteDoi = Object.fromEntries(site.map(p => [p.id, p.doi]));
  const behind = live.filter(p => siteDoi[p.id] !== `https://doi.org/${p.codeDoi}`).map(p => p.id);
  if (behind.length) findings.push(`**Papers:** ${behind.join(', ')} differ from GENChase's registry. The Sync papers workflow should fix this within six hours; if it does not, run it by hand (Actions > Sync papers from GENChase > Run workflow).`);
  const broken = [];
  for (const p of site) {
    try { const r = await fetch(p.pdf, { method: 'HEAD', signal: AbortSignal.timeout(30000) }); if (!r.ok) broken.push(`${p.id} (HTTP ${r.status})`); }
    catch (e) { broken.push(`${p.id} (${e.message})`); }
  }
  if (broken.length) findings.push(`**Paper PDF links:** ${broken.join(', ')} do not resolve. Check the PDF path in GENChase's papers/papers.json and the companion repository.`);
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

for (const [name, check] of [['papers', papers], ['catalog', catalog], ['cipher lab', cipherLab]]) {
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
