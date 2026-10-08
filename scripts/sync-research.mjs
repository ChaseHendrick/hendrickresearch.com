// Pulls the cipher research ledgers from Undeciphered-Texts (docs/research-notes/research-feed.json, which its
// tools/refresh_docs.py writes from the status ledgers) into src/research-feed.json, so each case on the Cipher
// Lab page shows its current stage, review date and tally of hypothesis families without hand edits.
// Runs before every build (npm "prebuild") and from .github/workflows/sync-papers.yml.
//   node scripts/sync-research.mjs [--from <local research-feed.json>]
// If the feed cannot be fetched or fails validation, the committed snapshot is kept.
import { readFileSync, writeFileSync } from 'node:fs';

export const FEED = 'https://raw.githubusercontent.com/ChaseHendrick/Undeciphered-Texts/main/docs/research-notes/research-feed.json';
const OUT = new URL('../src/research-feed.json', import.meta.url);

/** The fields the site renders, from a research-feed-1 document. Throws when the feed is not one. */
export function slim(feed) {
  if (feed?.schema !== 'research-feed-1' || !Array.isArray(feed.cases) || !feed.cases.length) throw new Error('not a research-feed-1 document');
  const cases = feed.cases.map(c => {
    for (const key of ['id', 'title', 'stage', 'reviewed_through', 'summary', 'note_url', 'ledger_url', 'unit']) {
      if (typeof c[key] !== 'string' || !c[key]) throw new Error(`case ${c.id ?? '?'}: missing ${key}`);
    }
    if (!/^[a-z0-9-]+$/.test(c.id) || !/^\d{4}-\d{2}-\d{2}$/.test(c.reviewed_through)) throw new Error(`case ${c.id}: bad id or date`);
    if (c.plaintext_recovered_percent !== 0) throw new Error(`case ${c.id}: the feed reports recovered plaintext; the site says no case is a reading`);
    for (const url of [c.note_url, c.ledger_url]) {
      if (!url.startsWith('https://github.com/ChaseHendrick/Undeciphered-Texts/')) throw new Error(`case ${c.id}: link outside the repository`);
    }
    return {
      id: c.id,
      title: c.title,
      stage: c.stage,
      unit: c.unit,
      reviewed_through: c.reviewed_through,
      summary: c.summary,
      note_url: c.note_url,
      ledger_url: c.ledger_url,
      statuses: (c.statuses || []).map(s => ({ status: s.status, label: s.label, count: s.count })),
    };
  });
  return { schema: 'site-research-1', source: FEED, note: feed.note, cases };
}

async function main() {
  const from = process.argv.indexOf('--from');
  let feed;
  try {
    if (from > 0) feed = JSON.parse(readFileSync(process.argv[from + 1], 'utf8'));
    else {
      const res = await fetch(FEED, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      feed = await res.json();
    }
  } catch (e) {
    console.warn(`sync-research: could not read the research feed (${e.message}); keeping the committed snapshot.`);
    return;
  }
  let next;
  try { next = JSON.stringify(slim(feed), null, 2) + '\n'; }
  catch (e) { console.warn(`sync-research: ${e.message}; keeping the committed snapshot.`); return; }
  let prev = '';
  try { prev = readFileSync(OUT, 'utf8'); } catch { /* first run */ }
  if (next !== prev) { writeFileSync(OUT, next); console.log('sync-research: wrote the research feed.'); }
  else console.log('sync-research: research feed unchanged.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
