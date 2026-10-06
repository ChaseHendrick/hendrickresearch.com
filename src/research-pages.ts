import feed from './research-data.json';
import { escapeHTML, origin, type ContentPage } from './content-pages';

// Ongoing research and pre-print work on undeciphered texts, rendered from the feed that
// Undeciphered-Texts writes (docs/research-notes/research-feed.json, synced by scripts/sync-research.mjs).
// Every page carries a plain-language view and a researcher view in its initial HTML; JavaScript only
// switches between them and runs the interactive modules.

type Status = { status: string; label: string; definition: string; count: number; percent: number };
type Family = { family: string; status: string; status_label: string; evidence: string; next: string | null; priority: number | null; logs: string[] };
export type Row = { label: string; value: number; median?: number; within_8?: number | null };
export type Chart = { id: string; kind: string; title: string; caption: string; unit: string; log?: string; rows: Row[] };
type Faq = { q: string; a: string };
type Case = {
  id: string; title: string; kind: string; stage: string; unit: string; reviewed_through: string;
  plaintext_recovered_percent: number; summary: string; caveat: string; note_url: string; ledger_url: string; problem: string;
  statuses: Status[]; families: Family[]; next: { family: string; next: string }[];
  lay: { tagline: string; summary: string; what_it_is: string; what_we_found: string; whats_next: string; faq: Faq[]; background: string };
  researcher: { summary: string; methods: string[] };
  manuscript: { title: string; stage: string; deposited: boolean; status: string; folder: string } | null;
  charts: Chart[]; data: Record<string, unknown>; sources: { title: string; url: string }[];
};

export const researchCases = (feed as unknown as { cases: Case[] }).cases;
export const researchRepository = (feed as unknown as { repository: string }).repository;
export const researchHub = '/research/undeciphered/';
// The names people search for, where the case title differs.
const SEARCH_NAME: Record<string, string> = { dagapeyeff: "D'Agapeyeff Cipher", dorabella: 'Dorabella Cipher', zodiac: 'Zodiac Z13 and Z32 Ciphers', voynich: 'Voynich Manuscript', indus: 'Indus Script', phaistos: 'Phaistos Disc' };
const searchName = (c: Case) => SEARCH_NAME[c.id] ?? c.title;
const route = (c: Case) => `${researchHub}${c.id}/`;
const STAGE: Record<string, string> = { proposed: 'Planned', ongoing: 'Ongoing research', preprint: 'Pre-print stage' };
const KIND: Record<string, string> = { cipher: 'Historical cipher', script: 'Undeciphered script' };
const STEP: Record<string, number> = { open: 0, 'tested-without-power': 1, 'excluded-by-constraint': 2, 'excluded-by-count': 3, 'closed-with-power': 4 };
const shut = (c: Case) => c.statuses.filter(s => STEP[s.status] >= 2).reduce((n, s) => n + s.count, 0);
const total = (c: Case) => c.statuses.reduce((n, s) => n + s.count, 0);
const date = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const ext = (href: string, label: string) => `<a class="editorial-link" href="${escapeHTML(href)}" rel="noopener">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>`;
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/** A stacked bar of a case's statuses: one ordinal ramp, 2px gaps, labels and a legend. */
function statusBar(c: Case, compact = false): string {
  const n = total(c) || 1;
  const parts = c.statuses.filter(s => s.count > 0);
  const segments = parts.map(s => `<span class="rs-seg" data-step="${STEP[s.status]}" style="flex-grow:${s.count}" data-tip="${escapeHTML(`${s.label}: ${s.count} of ${n} (${s.percent} percent)`)}" tabindex="0" aria-label="${escapeHTML(`${s.label}: ${s.count}`)}">${!compact && s.count / n >= 0.12 ? `<span class="rs-seg-label">${s.count}</span>` : ''}</span>`).join('');
  const legend = c.statuses.map(s => `<li><span class="rs-swatch" data-step="${STEP[s.status]}" aria-hidden="true"></span>${escapeHTML(s.label)} <strong>${s.count}</strong></li>`).join('');
  return `<figure class="rs-status${compact ? ' rs-status-compact' : ''}"><div class="rs-bar" role="img" aria-label="${escapeHTML(c.summary)}">${segments}</div>${compact ? '' : `<ul class="rs-legend">${legend}</ul>`}</figure>`;
}

/** Horizontal bars for one series. The table view carries every number. */
export function barChart(chart: Chart): string {
  const max = Math.max(...chart.rows.map(r => r.value), 1);
  const hasMedian = chart.rows.some(r => r.median !== undefined);
  const limit = 12;
  const rows = chart.rows.map((r, i) => {
    const tip = `${r.label}: ${r.value.toLocaleString('en-US')} ${chart.unit}${r.median !== undefined ? `, median ${r.median}` : ''}`;
    return `<div class="rs-row" data-label="${escapeHTML(r.label)}"${i >= limit ? ' data-extra' : ''}><span class="rs-row-label">${escapeHTML(r.label)}</span><span class="rs-track"><span class="rs-fill" style="width:${Math.max(0.5, (100 * r.value) / max).toFixed(2)}%" data-value="${r.value}" data-median="${r.median ?? ''}" data-tip="${escapeHTML(tip)}" tabindex="0"></span></span><span class="rs-row-value">${r.value.toLocaleString('en-US')}</span></div>`;
  }).join('');
  const table = `<details class="rs-table-view"><summary>Show the numbers as a table</summary><div class="rs-scroll"><table><thead><tr><th scope="col">Row</th><th scope="col">${escapeHTML(chart.unit)}</th>${hasMedian ? '<th scope="col">Median</th><th scope="col">Windows within 8</th>' : ''}</tr></thead><tbody>${chart.rows.map(r => `<tr><td>${escapeHTML(r.label)}</td><td>${r.value.toLocaleString('en-US')}</td>${hasMedian ? `<td>${r.median ?? ''}</td><td>${r.within_8 ?? ''}</td>` : ''}</tr>`).join('')}</tbody></table></div></details>`;
  const toggle = hasMedian ? `<div class="rs-chip-row" role="group" aria-label="Measure"><button class="rs-chip" aria-pressed="true" data-measure="value">Closest window</button><button class="rs-chip" aria-pressed="false" data-measure="median">Typical window (median)</button></div>` : '';
  return `<figure class="rs-chart" id="chart-${escapeHTML(chart.id)}" data-chart="${escapeHTML(chart.id)}"><figcaption><h3>${escapeHTML(chart.title)}</h3><p>${escapeHTML(chart.caption)}</p></figcaption>${toggle}<div class="rs-bars"${chart.rows.length > limit ? ' data-collapsed' : ''}>${rows}</div>${chart.rows.length > limit ? `<button class="rs-chip rs-more" type="button" aria-expanded="false">Show all ${chart.rows.length}</button>` : ''}${table}${chart.log ? `<p class="editorial-note">Source: ${ext(chart.log, 'the dated log behind this chart')}</p>` : ''}</figure>`;
}

function familiesTable(c: Case): string {
  const chips = [`<button class="rs-chip" aria-pressed="true" data-filter="all">All ${total(c)}</button>`, ...c.statuses.filter(s => s.count).map(s => `<button class="rs-chip" aria-pressed="false" data-filter="${escapeHTML(s.status)}"><span class="rs-swatch" data-step="${STEP[s.status]}" aria-hidden="true"></span>${escapeHTML(s.label)} ${s.count}</button>`)].join('');
  const rows = c.families.map(f => `<tr data-status="${escapeHTML(f.status)}"><td><span class="rs-swatch" data-step="${STEP[f.status]}" aria-hidden="true"></span>${escapeHTML(f.status_label)}</td><th scope="row">${escapeHTML(f.family)}</th><td>${escapeHTML(f.evidence)}${f.next ? `<br/><span class="rs-next"><strong>Next:</strong> ${escapeHTML(f.next)}</span>` : ''}${f.logs.length ? `<br/>${f.logs.map((l, i) => `<a class="rs-log" href="${escapeHTML(l)}" rel="noopener">log ${i + 1}</a>`).join(' ')}` : ''}</td></tr>`).join('');
  return `<div class="rs-chip-row rs-family-filter" role="group" aria-label="Filter by status">${chips}</div><div class="rs-scroll"><table class="rs-families"><thead><tr><th scope="col">Status</th><th scope="col">${c.kind === 'script' ? 'Question' : 'Hypothesis family'}</th><th scope="col">Evidence</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function definitions(c: Case): string {
  return `<dl class="rs-defs">${c.statuses.map(s => `<div><dt><span class="rs-swatch" data-step="${STEP[s.status]}" aria-hidden="true"></span>${escapeHTML(s.label)}</dt><dd>${escapeHTML(s.definition.replace(/^[^:]+:\s*/, ''))}</dd></div>`).join('')}</dl>`;
}

function manuscriptCard(c: Case): string {
  const m = c.manuscript;
  if (!m) return '';
  return `<section class="editorial-section rs-manuscript" aria-labelledby="ms-${c.id}"><p class="eyebrow">Pre-print stage</p><h2 id="ms-${c.id}">${escapeHTML(m.title)}</h2><dl class="method-facts"><div><dt>Stage</dt><dd>${escapeHTML(m.stage)}</dd></div><div><dt>Deposited</dt><dd>${m.deposited ? 'Yes' : 'Not yet; no DOI'}</dd></div><div><dt>Review</dt><dd>${escapeHTML(m.status)}</dd></div></dl><p class="editorial-note">A draft manuscript is not peer reviewed and claims no reading. Its numbers are written by code from the same frozen results shown on this page.</p>${ext(`${researchRepository}/tree/main/${m.folder}`, 'Manuscript folder and reproduction steps')}</section>`;
}

/** Interactive modules with their data inlined; each works without a server. */
function modules(c: Case): string {
  const out: string[] = [];
  const cells = c.data.cells as string[] | undefined;
  if (cells) {
    const width = Number(c.data.grid_width ?? 14);
    const counts = new Map<string, number>();
    cells.forEach(cell => counts.set(cell, (counts.get(cell) ?? 0) + 1));
    const top = Math.max(...counts.values());
    const grid = cells.map((cell, i) => `<button class="rs-cell" data-cell="${cell}" data-i="${i}" data-heat="${Math.ceil((6 * (counts.get(cell) ?? 0)) / top)}" aria-label="${escapeHTML(`Row ${Math.floor(i / width) + 1}, column ${(i % width) + 1}: ${cell}, appears ${counts.get(cell)} times`)}">${cell}</button>`).join('');
    out.push(`<section class="editorial-section rs-module" aria-labelledby="grid-title"><h2 id="grid-title">Explore the 196 cells.</h2><p class="section-intro">Each pair of digits names a cell of a 5 by 5 letter square: the first digit picks the row (6, 7, 8, 9 or 0) and the second the column (1 to 5). Select a cell to see every place it appears. Shading shows how common a cell is. Type a 25-letter square to see what the cells would say under it; whatever you type, the result will look like random letters unless the cells were also rearranged.</p><div class="rs-grid-tools"><div class="rs-chip-row" role="group" aria-label="Show cells as"><button class="rs-chip" aria-pressed="true" data-show="pairs">Digit pairs</button><button class="rs-chip" aria-pressed="false" data-show="letters">Letters under a square</button><button class="rs-chip" aria-pressed="true" data-heat-toggle>Shading</button></div><label class="rs-square">Your square, 25 letters, row by row (J is folded into I)<input id="rs-square" value="ABCDEFGHIKLMNOPQRSTUVWXYZ" maxlength="40" spellcheck="false" autocomplete="off"/></label></div><div class="rs-grid" style="--w:${width}" data-width="${width}" data-heat-on>${grid}</div><p class="rs-readout" id="rs-grid-readout" role="status">Select a cell.</p><script type="application/json" id="rs-cells">${json(cells)}</script></section>`);
    out.push(`<section class="editorial-section rs-module" aria-labelledby="fit-title"><h2 id="fit-title">Test a text of your own.</h2><p class="section-intro">If a message were enciphered with a one-to-one letter key and then shuffled in any order, its letter counts would survive. Paste at least 196 letters of any language, and this counts how many of the cells would have to be wrong for the best 196-letter stretch of your text to fit. Ordinary English needs at least 8; the best Latin found so far, in 59.8 million letters, needs 3. Nothing you paste leaves your browser.</p><label class="rs-fit-label" for="rs-fit-text">Your text</label><textarea id="rs-fit-text" rows="6" placeholder="Paste a paragraph or a whole chapter..."></textarea><div class="editorial-actions"><button class="rs-button" id="rs-fit-run" type="button">Count the fit</button></div><p class="rs-readout" id="rs-fit-readout" role="status"></p></section>`);
  }
  const ciphertext = c.data.ciphertext as string | undefined;
  const clues = c.data.clues as { offset: number; text: string }[] | undefined;
  if (ciphertext && clues) {
    const at = new Map<number, { clue: number; letter: string }>();
    clues.forEach((clue, k) => [...clue.text].forEach((letter, j) => at.set(clue.offset + j, { clue: k, letter })));
    const strip = [...ciphertext].map((letter, i) => { const hit = at.get(i); return `<span class="rs-k4${hit ? ` rs-k4-clue rs-k4-c${hit.clue}` : ''}" data-i="${i}" tabindex="0" data-tip="${escapeHTML(`Position ${i}: ${letter}${hit ? `, plaintext ${hit.letter} (clue ${clues[hit.clue].text})` : ''}`)}"><b>${letter}</b>${hit ? `<i>${hit.letter}</i>` : ''}</span>`; }).join('');
    out.push(`<section class="editorial-section rs-module" aria-labelledby="k4-title"><h2 id="k4-title">The 97 letters and the two clues.</h2><p class="section-intro">The artist has said which plaintext letters sit under these positions. A method is tested by fitting one clue and checking whether it predicts the other. Choose which clue to hold back.</p><div class="rs-chip-row" role="group" aria-label="Clue held back"><button class="rs-chip" aria-pressed="true" data-hold="1">Fit ${escapeHTML(clues[0].text)}, hold back ${escapeHTML(clues[1].text)}</button><button class="rs-chip" aria-pressed="false" data-hold="0">Fit ${escapeHTML(clues[1].text)}, hold back ${escapeHTML(clues[0].text)}</button></div><div class="rs-k4-strip" data-hold="1">${strip}</div><p class="editorial-note">Positions count from 0 in the plaintext. Shaded letters are the clue used for fitting; outlined letters are held back for checking.</p></section>`);
  }
  return out.join('');
}

function casePage(c: Case): ContentPage {
  const lay = c.lay;
  const faq = lay.faq.map(f => `<details class="rs-faq"><summary>${escapeHTML(f.q)}</summary><p>${escapeHTML(f.a)}</p></details>`).join('');
  const charts = c.charts.map(barChart).join('');
  const plain = `<section class="rs-view" data-view="plain" aria-labelledby="plain-${c.id}"><h2 id="plain-${c.id}" class="rs-view-title">In plain words</h2><div class="rs-columns"><div><h3>What it is</h3><p>${escapeHTML(lay.what_it_is)}</p><h3>What we found</h3><p>${escapeHTML(lay.what_we_found)}</p><h3>What comes next</h3><p>${escapeHTML(lay.whats_next)}</p></div><aside class="rs-meter"><p class="rs-meter-lead">${c.plaintext_recovered_percent === 0 ? (c.kind === 'script' ? 'None of the text has been read.' : 'None of the message has been read.') : `${c.plaintext_recovered_percent} percent has been read.`} ${c.kind === 'script' ? `${shut(c)} of the ${total(c)} questions below have an answer.` : `${shut(c)} of the ${total(c)} ways it could have been made are ruled out.`}</p>${statusBar(c)}<p class="editorial-note">${escapeHTML(c.caveat)}</p></aside></div><h3>Questions people ask</h3>${faq}<p class="editorial-note">Background: ${ext(lay.background, 'encyclopedia overview')}</p></section>`;
  const researcher = `<section class="rs-view" data-view="researcher" aria-labelledby="res-${c.id}"><h2 id="res-${c.id}" class="rs-view-title">For researchers</h2><p class="rs-summary"><strong>${escapeHTML(c.summary)}</strong></p><p class="section-intro">${escapeHTML(c.researcher.summary)}</p><p class="rs-methods">${c.researcher.methods.map(m => `<span>${escapeHTML(m)}</span>`).join('')}</p><h3>Status definitions</h3>${definitions(c)}<h3>Every ${c.kind === 'script' ? 'question' : 'hypothesis family'} and its evidence</h3>${familiesTable(c)}<h3>Next steps, in planned order</h3><ol class="rs-next-list">${c.next.map(n => `<li><strong>${escapeHTML(n.family.replace(/[?.]$/, ''))}.</strong> ${escapeHTML(n.next)}</li>`).join('')}</ol><h3>Primary sources</h3><ul class="rs-sources">${c.sources.slice(0, 14).map(s => `<li><a href="${escapeHTML(s.url)}" rel="noopener">${escapeHTML(s.title)}</a></li>`).join('')}</ul><div class="editorial-actions">${ext(c.note_url, 'Full research note')}${ext(c.ledger_url, 'Status ledger (JSON)')}</div></section>`;
  const body = `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/research/">Research</a><span aria-hidden="true">/</span><a href="${researchHub}">Undeciphered texts</a><span aria-hidden="true">/</span><span>${escapeHTML(c.title)}</span></nav><section class="editorial-hero rs-hero" data-hero-shader="contours"><p class="eyebrow">${escapeHTML(KIND[c.kind] ?? c.kind)} / ${escapeHTML(STAGE[c.stage] ?? c.stage)} / reviewed ${escapeHTML(date(c.reviewed_through))}</p><h1>${escapeHTML(c.title)}</h1><p class="editorial-intro">${escapeHTML(lay.tagline)} ${escapeHTML(lay.summary)}</p></section><div class="rs-switch" role="group" aria-label="Choose a view" hidden><button class="rs-chip" aria-pressed="true" data-view-button="plain">Plain language</button><button class="rs-chip" aria-pressed="false" data-view-button="researcher">Researcher view</button><button class="rs-chip" aria-pressed="false" data-view-button="both">Both</button></div><div class="rs-views">${plain}${researcher}</div>${charts ? `<section class="editorial-section"><h2>Charts.</h2>${charts}</section>` : ''}${modules(c)}${manuscriptCard(c)}<section class="editorial-section"><h2>Other open cases.</h2><ul class="rs-case-list">${researchCases.filter(o => o.id !== c.id).map(o => card(o, true)).join('')}</ul>${ext(researchHub, 'All undeciphered-text research')}</section><div class="rs-tip" role="tooltip" hidden></div>`;
  const description = `${searchName(c)}: is it solved? ${lay.tagline} Plain-language status, charts and the evidence, updated ${date(c.reviewed_through)}.`.slice(0, 300);
  return {
    route: route(c),
    title: `${searchName(c)}: Is It Solved? Status, Evidence & Charts | Hendrick Research`,
    description,
    body,
    schema: {
      '@type': 'FAQPage',
      dateModified: c.reviewed_through,
      about: { '@type': 'Thing', name: c.title, sameAs: lay.background },
      author: { '@type': 'Person', name: 'Chase Hendrick', sameAs: 'https://orcid.org/0009-0002-9754-6087' },
      isBasedOn: { '@type': 'Dataset', name: `${c.title} status ledger`, url: c.ledger_url, isAccessibleForFree: true },
      mainEntity: lay.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Research', item: origin + '/research/' },
        { '@type': 'ListItem', position: 2, name: 'Undeciphered texts', item: origin + researchHub },
        { '@type': 'ListItem', position: 3, name: c.title, item: origin + route(c) },
      ] },
    },
  };
}

function card(c: Case, small = false): string {
  const tally = c.kind === 'script' ? `${shut(c)} of ${total(c)} questions answered` : `${shut(c)} of ${total(c)} hypotheses ruled out`;
  if (small) return `<li><a href="${route(c)}">${escapeHTML(c.title)}</a><span>${escapeHTML(tally)}</span></li>`;
  return `<article><p class="eyebrow">${escapeHTML(KIND[c.kind] ?? c.kind)} / ${escapeHTML(STAGE[c.stage] ?? c.stage)}</p><h3><a href="${route(c)}">${escapeHTML(c.title)}</a></h3><p>${escapeHTML(c.lay.tagline)} ${escapeHTML(tally)}; reviewed ${escapeHTML(date(c.reviewed_through))}.</p></article>`;
}

function hubPage(): ContentPage {
  const ordered = [...researchCases].sort((a, b) => (STEP[b.stage === 'preprint' ? 'closed-with-power' : 'open'] - STEP[a.stage === 'preprint' ? 'closed-with-power' : 'open']) || shut(b) / (total(b) || 1) - shut(a) / (total(a) || 1));
  const preprints = researchCases.filter(c => c.manuscript);
  const overview = `<figure class="rs-chart"><figcaption><h3>How much of each case has been ruled out or answered</h3><p>Each bar is one case's listed hypotheses or questions, darker meaning more settled. No case has any text read.</p></figcaption><div class="rs-overview">${ordered.map(c => `<div class="rs-overview-row"><a href="${route(c)}">${escapeHTML(c.title)}</a>${statusBar(c, true)}<span>${shut(c)}/${total(c)}</span></div>`).join('')}</div><ul class="rs-legend">${[['open', 'Open'], ['tested-without-power', 'Tested, not closed'], ['excluded-by-constraint', 'Excluded by clues'], ['excluded-by-count', 'Excluded by a count'], ['closed-with-power', 'Closed with shown power']].map(([s, l]) => `<li><span class="rs-swatch" data-step="${STEP[s]}" aria-hidden="true"></span>${l}</li>`).join('')}</ul><details class="rs-table-view"><summary>Show the numbers as a table</summary><div class="rs-scroll"><table><thead><tr><th scope="col">Case</th><th scope="col">Stage</th>${['Open', 'Tested', 'Excluded by clues', 'Excluded by a count', 'Closed with power'].map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${ordered.map(c => `<tr><th scope="row">${escapeHTML(c.title)}</th><td>${escapeHTML(STAGE[c.stage] ?? c.stage)}</td>${['open', 'tested-without-power', 'excluded-by-constraint', 'excluded-by-count', 'closed-with-power'].map(s => `<td>${c.statuses.find(x => x.status === s)?.count ?? '·'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details></figure>`;
  const method = `<section class="editorial-section"><h2>How progress is judged here.</h2><p class="section-intro">A search that finds nothing only means something if it could have found something. So before a search is run on a cipher, a real text of the same length is enciphered the same way and the search has to get it back. The same search is then run on the cipher with its symbols shuffled; if the real cipher scores no better than the shuffles, there is no signal. Some properties, like how often each symbol occurs, survive any reordering, and those can rule a system out with no search at all.</p><p class="section-intro">A few English-looking words are easy to produce from almost anything. Nothing on these pages is called solved, and nothing will be, without one fixed method that reproduces the whole text and some independent confirmation.</p></section>`;
  const body = `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/research/">Research</a><span aria-hidden="true">/</span><span>Undeciphered texts</span></nav><section class="editorial-hero rs-hero" data-hero-shader="contours"><p class="eyebrow">ONGOING RESEARCH / PRE-PRINTS / OPEN DATA</p><h1>Texts nobody<br/><em>can read yet.</em></h1><p class="editorial-intro">Nine unsolved ciphers and unread scripts, from a puzzle printed in a 1939 book to clay tablets from Bronze Age Crete. Each page says in plain words what the thing is and what has been ruled out, and has a second view with the full evidence for anyone who wants to check it. None of them has been read here.</p></section><section class="editorial-section">${overview}</section><section class="editorial-section"><h2>The cases.</h2><div class="research-collection">${ordered.map(c => card(c)).join('')}</div></section>${preprints.length ? `<section class="editorial-section"><h2>At pre-print stage.</h2><div class="research-collection">${preprints.map(c => `<article><p class="eyebrow">${escapeHTML(c.manuscript!.stage)}</p><h3><a href="${route(c)}#ms-${c.id}">${escapeHTML(c.manuscript!.title)}</a></h3><p>${escapeHTML(c.manuscript!.status)}</p></article>`).join('')}</div></section>` : ''}${method}<section class="editorial-section"><h2>For researchers.</h2><p class="section-intro">Every number on these pages is generated from status ledgers in the public repository, each citing dated logs with frozen results, hashes and code. The pages rebuild when the ledgers change.</p><div class="editorial-actions">${ext(`${researchRepository}/tree/main/docs/research-notes`, 'Research notes and ledgers')}${ext(`${researchRepository}/blob/main/docs/research-notes/research-feed.json`, 'Machine-readable feed (JSON)')}${ext('/cipher-lab/', 'Try the cipher solvers in your browser')}</div></section><div class="rs-tip" role="tooltip" hidden></div>`;
  return {
    route: researchHub,
    title: 'Undeciphered Texts: Ongoing Research, Status & Charts | Hendrick Research',
    description: 'Plain-language status of famous unsolved ciphers and scripts: the D\'Agapeyeff cipher, Kryptos K4, Voynich, Linear A, Indus, Rongorongo, Phaistos, Zodiac and Dorabella, with charts and evidence.',
    body,
    schema: {
      '@type': 'CollectionPage',
      about: [{ '@type': 'Thing', name: 'Cryptanalysis' }, { '@type': 'Thing', name: 'Undeciphered writing systems' }],
      author: { '@type': 'Person', name: 'Chase Hendrick', sameAs: 'https://orcid.org/0009-0002-9754-6087' },
      mainEntity: { '@type': 'ItemList', numberOfItems: researchCases.length, itemListElement: ordered.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: origin + route(c), name: c.title })) },
      hasPart: { '@type': 'Dataset', name: 'Undeciphered-texts research feed', url: `${researchRepository}/blob/main/docs/research-notes/research-feed.json`, isAccessibleForFree: true, creator: { '@type': 'Person', name: 'Chase Hendrick' } },
    },
  };
}

export function researchPages(): ContentPage[] {
  return [hubPage(), ...researchCases.map(casePage)];
}

/** A short block for the main research page. */
export function researchTeaser(): string {
  return `<section class="editorial-section"><h2>Ongoing research: undeciphered texts.</h2><p class="section-intro">Unsolved ciphers and unread scripts, with what has been ruled out, charts, and a researcher view. One manuscript is at pre-print stage.</p><ul class="rs-case-list">${researchCases.map(c => card(c, true)).join('')}</ul>${ext(researchHub, 'Open the undeciphered-texts research hub')}</section>`;
}
