import { escapeHTML } from './content-pages';
import researchFeed from './research-feed.json';

type ResearchSource = { title: string; url: string };
type ResearchCase = {
  id: string;
  title: string;
  category: string;
  checked: string;
  status: string;
  context: string;
  experiment: string;
  note: string;
  sources: readonly ResearchSource[];
};

type LedgerStatus = { status: string; label: string; count: number };
type Ledger = { id: string; title: string; stage: string; unit: string; reviewed_through: string; summary: string; note_url: string; ledger_url: string; statuses: LedgerStatus[] };

const notesRoot = 'https://github.com/ChaseHendrick/undeciphered-texts/blob/main/docs/research-notes';
const firstChecked = '2026-10-03';
const ledgers: Record<string, Ledger> = Object.fromEntries((researchFeed.cases as Ledger[]).map(item => [item.id, item]));
const latestReview = (researchFeed.cases as Ledger[]).map(item => item.reviewed_through).sort().at(-1) ?? firstChecked;

const cases: readonly ResearchCase[] = [
  {
    id: 'kryptos-k4', title: 'Kryptos K4', category: 'Historical cipher', checked: '2026-10-03',
    status: 'Publicly unsolved; plaintext reported in a private archive, no method in the checked sources.',
    context: 'RR Auction’s October 2025 account describes recovered archival text, not a published method; in November 2025 it sold Sanborn’s archive, relying on his description that it holds the private K4 plaintext and coding material. Paradigm identified itself as custodian in June 2026 and offers a reference-answer verifier while still calling K4 unsolved. This project fitted each clue in turn and checked the other against 32,512 two-layer cipher models on two fixed alphabets (65,024 checks in all): all 888 complete keys contradicted the held-back clue, 2,563 stay undetermined, and no planted-text control at these search bounds is recorded.',
    experiment: 'Rerun the layered search with unknown keyed alphabets in place of the two fixed ones, solved with a constraint solver, with clue positions frozen before fitting and one clue held back. Even then, a failed search speaks only to the fully determined keys of its stated models.',
    note: 'kryptos-k4-2026-10-03.md',
    sources: [
      { title: 'RR Auction: archive discovery, 23 October 2025', url: 'https://content.rrauction.com/kryptos-k4-discovered-not-solved-heres-what-actually-happened/' },
      { title: 'RR Auction: private archive sale, 21 November 2025', url: 'https://content.rrauction.com/jim-sanborns-complete-kryptos-archive-sells-for-962500-at-auction/' },
      { title: 'Paradigm: current custodian update, 12 June 2026', url: 'https://www.paradigm.xyz/writing/kryptos' },
      { title: 'RR Auction: archive lot and verification limits', url: 'https://www.rrauction.com/auctions/lot-detail/350761607302001-the-complete-secrets-of-kryptos-jim-sanborns-private-archive/' },
    ],
  },
  {
    id: 'dagapeyeff', title: 'D’Agapeyeff challenge', category: 'Historical cipher', checked: '2026-10-05',
    status: 'No accepted reading; ruling hypotheses out is not a decipherment.',
    context: 'Wikipedia attributes the challenge to D’Agapeyeff’s Codes and Ciphers (1939); no reading of its 196 digit pairs is accepted. Under any one-to-one letter key and any reordering, the closest of 479,051 overlapping 196-letter stretches of English prose needs 8 chosen errors to match the pairs’ counts, and searches shown to find planted English and Latin texts found nothing. Hendrick’s interpretation, not a result: most likely there is no message, and under a one-to-one key the counts point to Latin.',
    experiment: 'Build a turning-grille search that recovers planted texts with the key unknown, including keys that even out letter counts, then compare the pairs with shuffled copies. If the pairs score like their shuffles, that rules out a grille only under the keys and languages tested.',
    note: 'dagapeyeff-2026-10-05.md',
    sources: [
      { title: 'Wikipedia: D’Agapeyeff cipher and digit transcription', url: 'https://en.wikipedia.org/wiki/D%27Agapeyeff_cipher' },
      { title: 'Hendrick: preprint 1.0.0 on Zenodo, not peer reviewed', url: 'https://doi.org/10.5281/zenodo.23241304' },
      { title: 'Hendrick: companion repository with code and data', url: 'https://github.com/ChaseHendrick/dagapeyeff' },
    ],
  },
  {
    id: 'voynich', title: 'Voynich manuscript', category: 'Unidentified script', checked: '2026-10-03',
    status: 'Meaning unresolved; encipherment itself is uncertain.',
    context: 'Yale identifies an unknown script and cautions that the manuscript may not be encoded. EVA and other transliterations represent visible signs, not established sounds or translations.',
    experiment: 'Compare the Zandbergen-Landini ZL 3b transliteration with an independently authored second one on shared loci and publish the disagreement table. Then reserve 10 whole folios and test held-out prediction against shuffles that keep word or line lengths.',
    note: 'voynich-2026-10-03.md',
    sources: [
      { title: 'Yale Library: Beinecke MS 408', url: 'https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript' },
      { title: 'René Zandbergen: transliteration resources', url: 'https://www.voynich.nu/transcr.html' },
    ],
  },
  {
    id: 'linear-a', title: 'Linear A', category: 'Undeciphered writing system', checked: '2026-10-03',
    status: 'Approximate sign readings do not establish the language.',
    context: 'SigLA connects inscriptions with sign occurrences and their material context. By convention, scholars roughly sound out many signs with the values of similar-looking Linear B signs, but the underlying language is unknown, so most words are not understood.',
    experiment: 'Preserve sign numbers, uncertain readings and document types. Reserve one find-place before choosing features and test whether repeated sign sequences recur there, rather than selecting a proposed language from a few attractive matches.',
    note: 'linear-a-2026-10-03.md',
    sources: [
      { title: 'SigLA: project and inscription database', url: 'https://sigla.phis.me/about.html' },
      { title: 'Salgarella and Castellan: database methods', url: 'https://sigla.phis.me/paper.html' },
    ],
  },
  {
    id: 'indus', title: 'Indus signs', category: 'Unresolved sign system', checked: '2026-10-03',
    status: 'Statistical structure is evidence about sequences, not a translation.',
    context: 'Yadav and colleagues’ 2010 n-gram study notes a limited corpus, no bilingual texts and an uncertain underlying language. Its predictive experiments concern sign sequences; they do not provide a decipherment.',
    experiment: 'Record each artifact’s identifier, orientation and whether the image is a seal face or an impression. Group duplicates and related artifacts, hold back 20 percent of the groups, and compare n-gram prediction of masked signs in those groups with unigram and position baselines.',
    note: 'indus-2026-10-03.md',
    sources: [
      { title: 'Yadav and colleagues: primary n-gram study', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0009506' },
      { title: 'Rao: economic-use hypothesis, 2018', url: 'https://arxiv.org/abs/1812.00049' },
    ],
  },
  {
    id: 'rongorongo', title: 'Rongorongo', category: 'Undeciphered script', checked: '2026-10-03',
    status: 'A material date does not determine an inscription’s reading or date.',
    context: 'The 2024 radiocarbon study dates wood from four tablets and reports one notably older specimen, but allows that old wood may have been carved later. Of two British Museum records checked here, one is an original tablet and one a plaster cast; counting casts or photographs as separate texts would inflate the corpus.',
    experiment: 'Build an object ledger separating originals, casts and copies. Keeping line orientation, test whether passages repeated on the other tablets recur on one held-out original, against line-length-preserving shuffles.',
    note: 'rongorongo-2026-10-03.md',
    sources: [
      { title: 'Ferrara and colleagues: radiocarbon study, 2024', url: 'https://doi.org/10.1038/s41598-024-53063-7' },
      { title: 'British Museum: original wooden tablet', url: 'https://artsandculture.google.com/asset/wooden-tablet-with-rongorongo-inscription/YQFZoZpx2-hP1Q?hl=en' },
      { title: 'British Museum: plaster cast record', url: 'https://www.britishmuseum.org/collection/object/E_Oc1981-Q-1642' },
    ],
  },
  {
    id: 'phaistos', title: 'Phaistos disc', category: 'Undeciphered inscription', checked: '2026-10-03',
    status: 'The museum reports no definitive interpretation.',
    context: 'Heraklion’s object description records 241 stamped signs in 61 groups across two sides. Proposed word boundaries and a hymn interpretation remain interpretations, not recovered plaintext.',
    experiment: 'Compare independent sign annotations while preserving side, group and reading direction. Freeze up to 12 annotation and grouping variants before any language scoring, then report how much repeated-group statistics depend on each disputed sign or boundary.',
    note: 'phaistos-disc-2026-10-03.md',
    sources: [
      { title: 'Heraklion Archaeological Museum: object description', url: 'https://heraklionmuseum.gr/en/exhibit/the-phaistos-disc/' },
      { title: 'Heraklion Museum: collection record', url: 'https://ca.heraklionmuseum.gr/ca/pawtucket/index.php/Detail/objects/336' },
    ],
  },
  {
    id: 'zodiac', title: 'Zodiac Z13 and Z32', category: 'Short historical ciphers', checked: '2026-10-03',
    status: 'Open in the cited authors’ account; Z340 is a solved control.',
    context: 'Z340’s solvers describe its verified solution and the remaining short ciphers. They explain that, under simple substitution assumptions, many compatible readings fit the Z13 and Z32 symbols, so the symbols alone do not single out one reading. This project has not yet run any test on these ciphers.',
    experiment: 'Reproduce the published Z340 transform as a separate control. For Z13 and Z32, count fitting readings from a fixed, hashed word list within 10,000 checks, publish several, and treat none as established without outside confirmation or an independently supported method linking the symbols to it.',
    note: 'zodiac-short-ciphers-2026-10-03.md',
    sources: [
      { title: 'Oranchak, Blake and Van Eycke: solution and remaining ciphers', url: 'https://arxiv.org/html/2403.17350v1' },
      { title: 'FBI Vault: original case documents', url: 'https://vault.fbi.gov/The%20Zodiac%20Killer' },
    ],
  },
  {
    id: 'dorabella', title: 'Dorabella cipher', category: 'Historical cipher', checked: '2026-10-03',
    status: 'The cited study and this project’s searches establish no systematic reading.',
    context: 'Hauer and colleagues test language, substitution and music hypotheses on an 87-character transcription with ambiguous symbol orientations. On their transcription, this project’s one-to-one and many-to-one English substitution searches each gave three conflicting outputs. Because the same methods recovered only 80 and 34 letters, respectively, of a known 87-letter test sentence, those outputs rule out neither model.',
    experiment: 'Have two people mark symbol orientations independently and freeze at most four transcriptions in all. Then measure full recovery on 100 new 87-character test messages before searching the note again.',
    note: 'dorabella-2026-10-03.md',
    sources: [
      { title: 'Hauer and colleagues: experimental analysis, 2021', url: 'https://softwareprocess.es/pubs/hauer2021HistoCrypt-dorabella.pdf' },
      { title: 'Hauer and colleagues: HistoCrypt code and data, 2021', url: 'https://doi.org/10.5281/zenodo.4819086' },
    ],
  },
];

export const cipherResearchTopics: string[] = cases.map(item => item.title);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}
const stageLabel = (stage: string): string => stage.charAt(0).toUpperCase() + stage.slice(1);
// Closed and excluded families first, then tested, then open; the bar reads left to right in that order.
const statusOrder = ['closed-with-power', 'excluded-by-count', 'excluded-by-constraint', 'tested-without-power', 'open'];

/** The case's synced ledger: its summary line and a tally of the families listed, as a bar with a text legend. */
function renderLedger(ledger: Ledger | undefined): string {
  if (!ledger) return '';
  const shown = ledger.statuses.filter(item => item.count > 0)
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  const total = shown.reduce((sum, item) => sum + item.count, 0);
  const legend = shown.map(item => `${item.label} ${item.count}`).join(', ');
  const bar = total ? `<div class="cipher-tally" role="img" aria-label="${escapeHTML(`${total} ${ledger.unit}: ${legend}`)}">${shown.map(item => `<span class="cipher-tally-${escapeHTML(item.status)}" style="flex-grow:${item.count}"></span>`).join('')}</div>
      <ul class="cipher-tally-legend">${shown.map(item => `<li><span class="cipher-tally-swatch cipher-tally-${escapeHTML(item.status)}" aria-hidden="true"></span>${escapeHTML(item.label)} <strong>${item.count}</strong></li>`).join('')}</ul>` : '';
  return `<div class="cipher-ledger"><p><strong>Ledger, reviewed through <time datetime="${escapeHTML(ledger.reviewed_through)}">${escapeHTML(longDate(ledger.reviewed_through))}</time>.</strong> ${escapeHTML(ledger.summary.replace(/ Reviewed through \d{4}-\d{2}-\d{2}\.$/, ''))}</p>${bar}</div>`;
}

function renderStatusLine(item: ResearchCase): string {
  const ledger = ledgers[item.id];
  return ledger ? `${item.category} · ${stageLabel(ledger.stage)}` : item.category;
}

function sourceLink(source: ResearchSource): string {
  return `<a class="text-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a>`;
}

/** Fixed editorial content only. No ciphertext, user input or HTML is accepted. */
export function renderCipherResearch(): string {
  return `<section id="cipher-research" class="cipher-research" aria-labelledby="cipher-research-title">
    <div class="cipher-section-heading"><div><p class="eyebrow">05 / RESEARCH NOTES</p><h2 id="cipher-research-title">Undeciphered scripts.<br />Open historical ciphers.</h2></div><p>Ledgers reviewed through<br /><time datetime="${escapeHTML(latestReview)}">${escapeHTML(longDate(latestReview))}</time></p></div>
    <p class="cipher-research-intro">The workbench above handles classical A-Z text. It does not decipher unknown glyph scripts. Those cases need a documented sign inventory, preserved uncertainty and linguistic or archaeological evidence beyond an English language score.</p>
    <p class="cipher-hint">These dated notes separate the source record from proposed experiments. Research plans are not executed results. “Open” describes the cited evidence, not a promise that no one has proposed an answer. A solved control checks a method; it does not solve a different historical target. Each case’s dated note records when its primary sources were checked, and its ledger line is synced from the repository’s status ledgers. Its tally counts the hypothesis families or questions listed there, not every possible cipher, and it is not a distance to a reading.</p>
    <div class="cipher-research-grid">${cases.map(item => `<details id="research-${escapeHTML(item.id)}" class="cipher-research-entry"><summary><span>${escapeHTML(item.title)}</span><span class="cipher-research-status">${escapeHTML(renderStatusLine(item))}</span></summary><div class="cipher-research-body"><h3>${escapeHTML(item.status)}</h3><p>${escapeHTML(item.context)}</p>${renderLedger(ledgers[item.id])}<div class="cipher-research-links">${item.sources.map(sourceLink).join('')}</div><p><strong>Next experiment.</strong> ${escapeHTML(item.experiment)}</p><div class="cipher-research-links"><a class="text-link" href="${escapeHTML(`${notesRoot}/${item.note}`)}" target="_blank" rel="noopener noreferrer"><span>Research note, sources checked <time datetime="${escapeHTML(item.checked)}">${escapeHTML(longDate(item.checked))}</time></span> <span aria-hidden="true">↗</span></a>${ledgers[item.id] ? `<a class="text-link" href="${escapeHTML(ledgers[item.id].ledger_url)}" target="_blank" rel="noopener noreferrer">Status ledger <span aria-hidden="true">↗</span></a>` : ''}</div></div></details>`).join('')}</div>
    <p class="cipher-hint">Source extraction limits, corpus access and reproducible bounds are recorded in the notes. No new historical decipherment is claimed; no case here is solved, and nothing on this page is a reading. <a href="${escapeHTML(`${notesRoot}/README.md`)}" target="_blank" rel="noopener noreferrer">Read the research register and experiment standards.</a></p>
  </section>`;
}
