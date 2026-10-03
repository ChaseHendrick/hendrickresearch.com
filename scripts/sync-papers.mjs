// Pulls the list of public preprints from GENChase's registry (papers/papers.json) so the
// site never has to be edited by hand when a paper is released or a new version gets a DOI.
// Runs before every build (npm "prebuild") and daily from .github/workflows/sync-papers.yml.
// If the registry cannot be fetched, the committed snapshot src/papers-data.json is kept.
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/ChaseHendrick/GENChase/main/papers/papers.json';
const OUT = new URL('../src/papers-data.json', import.meta.url);
const PUBLIC = new Set(['ready', 'on-arxiv', 'submitted', 'accepted', 'published']);

// The site's own topic labels and one-line summaries, where they differ from the registry's.
const OVERRIDES = {
  'minimal-winding': { category: 'Fluid dynamics', summary: 'Sharp winding bounds and computer-assisted results for collapsing vortex configurations.' },
  'collapse-without-rotation': { category: 'Fluid dynamics', summary: 'Cluster mechanisms and numerical phase diagrams for vortex collapse without rotation.' },
  'stable-expansion': { category: 'Fluid dynamics', summary: 'Computer-assisted configurations, nonlinear stability, and confinement estimates.' },
  'rank-window': { summary: 'The limits of inferring asymptotic smoothness from finite neural eigenspectra.' },
  'hh-dynamics': { summary: 'Computer-assisted analysis of equilibrium stability and bistability in the classical model.' },
  'double-pendulum': { category: 'Dynamical systems', summary: 'Interval arithmetic proofs for chaotic dynamics at specified energies.' },
  'nf-pulse': { summary: 'Computer-assisted pulse existence and spectral stability in neural field models.' },
  'hh-pulse': { summary: 'A computer-assisted existence proof for the propagated action potential at two temperatures.' },
};

const sentence = s => (s ? s[0].toUpperCase() + s.slice(1).replace(/\.?$/, '.') : '');

async function main() {
  let registry;
  try {
    const res = await fetch(SOURCE, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    registry = await res.json();
  } catch (e) {
    console.warn(`sync-papers: could not fetch the GENChase registry (${e.message}); keeping the committed snapshot.`);
    return;
  }
  const papers = registry.papers
    .filter(p => PUBLIC.has(p.status) && p.companion && p.codeDoi)
    .map(p => {
      const o = OVERRIDES[p.id] || {};
      const file = (p.pdf || '').split('/').pop() || `${p.id}.pdf`;
      return {
        id: p.id,
        title: p.title,
        category: o.category || p.field || 'Research',
        summary: o.summary || sentence(p.summary || ''),
        doi: `https://doi.org/${p.codeDoi}`,
        source: `https://github.com/${p.companion}`,
        pdf: `https://raw.githubusercontent.com/${p.companion}/main/paper/${file}`,
      };
    });
  if (!papers.length) { console.warn('sync-papers: registry listed no public papers; keeping the snapshot.'); return; }
  const next = JSON.stringify(papers, null, 2) + '\n';
  let prev = '';
  try { prev = readFileSync(OUT, 'utf8'); } catch { /* first run */ }
  if (next !== prev) { writeFileSync(OUT, next); console.log(`sync-papers: wrote ${papers.length} papers.`); }
  else console.log(`sync-papers: ${papers.length} papers, unchanged.`);
}
main();
