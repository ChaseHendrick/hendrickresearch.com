import { escapeHTML } from './content-pages';

type ResearchSource = { title: string; url: string };
type ResearchCase = {
  id: string;
  title: string;
  category: string;
  status: string;
  context: string;
  experiment: string;
  note: string;
  sources: readonly ResearchSource[];
};

const notesRoot = 'https://github.com/ChaseHendrick/undeciphered-texts/blob/main/docs/research-notes';
const checkedDate = '2026-10-03';

const cases: readonly ResearchCase[] = [
  {
    id: 'kryptos-k4', title: 'Kryptos K4', category: 'Historical cipher',
    status: 'Archival recovery documented; public method not established here.',
    context: 'Archival text recovery and the 2025 sale are documented. Paradigm identified itself as custodian in June 2026 and offers a reference-answer verifier while still calling K4 unsolved. The checked sources do not publish a reproducible full method. RR Auction listed private K4 plaintext and coding material, attributed to Sanborn without examining the contents independently.',
    experiment: 'Reserve one published clue while fitting another, then test every predicted letter and the complete forward transform. A failed bounded search rules out only its stated models.',
    note: 'kryptos-k4-2026-10-03.md',
    sources: [
      { title: 'RR Auction: archive discovery, 23 October 2025', url: 'https://content.rrauction.com/kryptos-k4-discovered-not-solved-heres-what-actually-happened/' },
      { title: 'RR Auction: private archive sale, 21 November 2025', url: 'https://content.rrauction.com/jim-sanborns-complete-kryptos-archive-sells-for-962500-at-auction/' },
      { title: 'Paradigm: current custodian update, 12 June 2026', url: 'https://www.paradigm.xyz/writing/kryptos' },
      { title: 'RR Auction: archive lot and verification limits', url: 'https://www.rrauction.com/auctions/lot-detail/350761607302001-the-complete-secrets-of-kryptos-jim-sanborns-private-archive/' },
    ],
  },
  {
    id: 'voynich', title: 'Voynich manuscript', category: 'Unidentified script',
    status: 'Meaning unresolved; encipherment itself is uncertain.',
    context: 'Yale identifies an unknown script and cautions that the manuscript may not be encoded. EVA and other transliterations represent visible signs, not established sounds or translations.',
    experiment: 'Compare two versioned transliterations against the same Yale folios. Hold out entire folios and test whether measured patterns survive alternative sign and space readings.',
    note: 'voynich-2026-10-03.md',
    sources: [
      { title: 'Yale Library: Beinecke MS 408', url: 'https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript' },
      { title: 'René Zandbergen: transliteration resources', url: 'https://www.voynich.nu/transcr.html' },
    ],
  },
  {
    id: 'linear-a', title: 'Linear A', category: 'Undeciphered writing system',
    status: 'Approximate sign readings do not establish the language.',
    context: 'SigLA connects inscriptions with sign occurrences and their material context. Some conventional readings borrow comparable Linear B sign values; that does not translate the underlying Linear A language.',
    experiment: 'Preserve sign numbers, uncertain readings and document types. Test repeated sequences on held-out sites rather than selecting a proposed language from a few attractive matches.',
    note: 'linear-a-2026-10-03.md',
    sources: [
      { title: 'SigLA: project and inscription database', url: 'https://sigla.phis.me/about.html' },
      { title: 'Salgarella and Castellan: database methods', url: 'https://sigla.phis.me/paper.html' },
    ],
  },
  {
    id: 'indus', title: 'Indus signs', category: 'Unresolved sign system',
    status: 'Statistical structure is evidence about sequences, not a translation.',
    context: 'The authored n-gram study identifies limited texts, no bilingual anchor and an unknown underlying language. Its predictive experiments concern sign sequences; they do not provide a decipherment.',
    experiment: 'Keep artifact identifiers and seal-versus-impression orientation. Evaluate masked signs on held-out artifacts against simple frequency baselines, excluding duplicate impressions across splits.',
    note: 'indus-2026-10-03.md',
    sources: [
      { title: 'Yadav and colleagues: primary n-gram study', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0009506' },
      { title: 'Rao: economic-use hypothesis, 2018', url: 'https://arxiv.org/abs/1812.00049' },
    ],
  },
  {
    id: 'rongorongo', title: 'Rongorongo', category: 'Undeciphered script',
    status: 'A material date does not determine an inscription’s reading or date.',
    context: 'The 2024 radiocarbon study reports older wood for one tablet but explicitly discusses reused wood and potentially later engraving. Museum records also distinguish original tablets from modern casts.',
    experiment: 'Build an object ledger separating originals, casts and copies. Preserve alternating line orientation, then test parallel sign passages on tablets excluded from the fitting set.',
    note: 'rongorongo-2026-10-03.md',
    sources: [
      { title: 'Ferrara and colleagues: radiocarbon study, 2024', url: 'https://doi.org/10.1038/s41598-024-53063-7' },
      { title: 'British Museum: original wooden tablet', url: 'https://artsandculture.google.com/asset/wooden-tablet-with-rongorongo-inscription/YQFZoZpx2-hP1Q?hl=en' },
      { title: 'British Museum: plaster cast record', url: 'https://www.britishmuseum.org/collection/object/E_Oc1981-Q-1642' },
    ],
  },
  {
    id: 'phaistos', title: 'Phaistos disc', category: 'Undeciphered inscription',
    status: 'The museum reports no definitive interpretation.',
    context: 'Heraklion’s object description records 241 stamped signs in 61 groups across two sides. Proposed word boundaries and a hymn interpretation remain interpretations, not recovered plaintext.',
    experiment: 'Compare independent sign annotations while preserving side, group and reading direction. Report sensitivity to disputed signs before attempting a language mapping on this single object.',
    note: 'phaistos-disc-2026-10-03.md',
    sources: [
      { title: 'Heraklion Archaeological Museum: object description', url: 'https://heraklionmuseum.gr/en/exhibit/the-phaistos-disc/' },
      { title: 'Heraklion Museum: collection record', url: 'https://ca.heraklionmuseum.gr/ca/pawtucket/index.php/Detail/objects/336' },
    ],
  },
  {
    id: 'zodiac', title: 'Zodiac Z13 and Z32', category: 'Short historical ciphers',
    status: 'Open in the cited authors’ account; Z340 is a solved control.',
    context: 'Z340’s solvers describe its verified solution and the remaining short ciphers. They explain why many plausible Z13 or Z32 readings can fit the available symbols without establishing a unique answer.',
    experiment: 'Reproduce the published Z340 transform as a separate control. For Z13 and Z32, enumerate competing compatible readings and require external evidence before treating a name or location as established.',
    note: 'zodiac-short-ciphers-2026-10-03.md',
    sources: [
      { title: 'Oranchak, Blake and Van Eycke: solution and remaining ciphers', url: 'https://arxiv.org/html/2403.17350v1' },
      { title: 'FBI Vault: original case documents', url: 'https://vault.fbi.gov/The%20Zodiac%20Killer' },
    ],
  },
  {
    id: 'dorabella', title: 'Dorabella cipher', category: 'Historical cipher',
    status: 'The cited experiments do not establish a systematic reading.',
    context: 'Hauer and colleagues test language, substitution and music hypotheses. Their 87-character transcription includes ambiguous symbol orientations. Failed solver trials are evidence about tested assumptions, not a proof that every possible method fails.',
    experiment: 'Freeze alternative glyph readings before search. Compare bounded trials with matching synthetic controls, keeping attractive English phrases separate from independently verified evidence.',
    note: 'dorabella-2026-10-03.md',
    sources: [
      { title: 'Hauer and colleagues: experimental analysis, 2021', url: 'https://softwareprocess.es/pubs/hauer2021HistoCrypt-dorabella.pdf' },
    ],
  },
];

export const cipherResearchTopics: string[] = cases.map(item => item.title);

function sourceLink(source: ResearchSource): string {
  return `<a class="text-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a>`;
}

/** Fixed editorial content only. No ciphertext, user input or HTML is accepted. */
export function renderCipherResearch(): string {
  return `<section id="cipher-research" class="cipher-research" aria-labelledby="cipher-research-title">
    <div class="cipher-section-heading"><div><p class="eyebrow">05 / RESEARCH NOTES</p><h2 id="cipher-research-title">Undeciphered scripts.<br />Open historical ciphers.</h2></div><p>Primary sources checked<br /><time datetime="${checkedDate}">3 October 2026</time></p></div>
    <p class="cipher-research-intro">The workbench above handles classical A-Z text. It does not decipher unknown glyph scripts. Those cases need a documented sign inventory, preserved uncertainty and linguistic or archaeological evidence beyond an English language score.</p>
    <p class="cipher-hint">These dated notes separate the source record from proposed experiments. Research plans are not executed results. “Open” describes the cited evidence, not a promise that no one has proposed an answer. A solved control checks a method; it does not solve a different historical target.</p>
    <div class="cipher-research-grid">${cases.map(item => `<details id="research-${escapeHTML(item.id)}" class="cipher-research-entry"><summary><span>${escapeHTML(item.title)}</span><span class="cipher-research-status">${escapeHTML(item.category)}</span></summary><div class="cipher-research-body"><h3>${escapeHTML(item.status)}</h3><p>${escapeHTML(item.context)}</p><div class="cipher-research-links">${item.sources.map(sourceLink).join('')}</div><p><strong>Next experiment.</strong> ${escapeHTML(item.experiment)}</p><a class="text-link" href="${escapeHTML(`${notesRoot}/${item.note}`)}" target="_blank" rel="noopener noreferrer">Dated research note and evidence limits <span aria-hidden="true">↗</span></a></div></details>`).join('')}</div>
    <p class="cipher-hint">Source extraction limits, corpus access and reproducible bounds are recorded in the notes. No new historical decipherment is claimed. <a href="${escapeHTML(`${notesRoot}/README.md`)}" target="_blank" rel="noopener noreferrer">Read the research register and experiment standards.</a></p>
  </section>`;
}
