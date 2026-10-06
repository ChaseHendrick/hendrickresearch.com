// Pulls the undeciphered-texts research feed from Undeciphered-Texts, whose tools/refresh_docs.py
// writes it from the status ledgers on every push to main. Runs before every build (npm "prebuild")
// and every six hours from .github/workflows/sync-research.yml, which commits src/research-data.json
// when it changes so Vercel redeploys. If the feed cannot be fetched or fails its checks, the
// committed snapshot is kept.
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/ChaseHendrick/Undeciphered-Texts/main/docs/research-notes/research-feed.json';
const OUT = new URL('../src/research-data.json', import.meta.url);

function check(feed) {
  if (feed.schema !== 'research-feed-1') throw new Error(`unknown schema ${feed.schema}`);
  if (!Array.isArray(feed.cases) || !feed.cases.length) throw new Error('no cases');
  for (const c of feed.cases) {
    if (!/^[a-z0-9-]+$/.test(c.id)) throw new Error(`bad case id ${c.id}`);
    for (const key of ['title', 'summary', 'caveat', 'note_url', 'lay', 'researcher', 'statuses', 'families']) {
      if (!(key in c)) throw new Error(`${c.id} has no ${key}`);
    }
    if (c.plaintext_recovered_percent !== 0) throw new Error(`${c.id} claims a reading; refusing to publish it automatically`);
  }
}

async function main() {
  let text;
  try {
    const res = await fetch(SOURCE, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
    check(JSON.parse(text));
  } catch (e) {
    console.warn(`sync-research: keeping the committed snapshot (${e.message}).`);
    return;
  }
  let prev = '';
  try { prev = readFileSync(OUT, 'utf8'); } catch { /* first run */ }
  if (text !== prev) { writeFileSync(OUT, text); console.log('sync-research: wrote the research feed.'); }
  else console.log('sync-research: research feed unchanged.');
}
main();
