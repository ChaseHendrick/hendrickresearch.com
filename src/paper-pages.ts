import paperData from './paper-data.json';
import { papers } from './content';
import { escapeHTML, origin, type ContentPage } from './content-pages';
import { explainers, type Explainer } from './paper-explainers';
import { barChart, type Chart } from './research-pages';

// One explainer page per published preprint: a plain-language view and a researcher view in the
// initial HTML, charts drawn from the paper's own data, an interactive model of the paper's system,
// and the paper's figures. Data comes from src/paper-data.json (scripts/extract-paper-data.py).

type Config = { N: number; alpha: number; z: number[][]; G: number[]; P?: number };
type PaperRecord = { source: { repository: string; commit: string; path: string }; figures: string[]; abstract: string; [key: string]: unknown };
const data = paperData as unknown as Record<string, PaperRecord>;
export const paperRoute = (id: string) => `/research/papers/${id}/`;
const ext = (href: string, label: string) => `<a class="editorial-link" href="${escapeHTML(href)}" rel="noopener">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>`;
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
const fmt = (x: number, digits = 4) => x.toLocaleString('en-US', { maximumFractionDigits: digits });

function charts(id: string): string {
  const d = data[id] as Record<string, any>;
  const out: Chart[] = [];
  if (id === 'minimal-winding') {
    out.push({ id: 'winding', kind: 'bar', unit: 'radians', log: `${d.source.repository}/tree/${d.source.commit}/data`, title: 'The least winding found, by number of vortices',
      caption: 'Three vortices: the proved lower bound. Four to six: proved local minima. Seven and more: numerical. The continuum value is from the sequel paper. Fewer turns mean a tighter fall into the collision point.',
      rows: [...(d.winding as any[]).map(w => ({ label: `${w.N} vortices${w.N === 3 ? ' (bound)' : w.kind === 'numerical' ? ' (numerical)' : ' (proved)'}`, value: Number(w.P.toFixed(4)) })), { label: 'Continuum (numerical)', value: Number(d.continuum.toFixed(4)) }] });
  }
  if (id === 'collapse-without-rotation') {
    out.push({ id: 'phase', kind: 'bar', unit: 'vortices', title: 'Fewest vortices that can collapse without rotating, by alpha',
      caption: 'Numerical. Smaller alpha is closer to an ordinary fluid (alpha = 0); the count grows quickly as alpha falls, and fits suggest an ordinary fluid would need infinitely many.',
      rows: (d.phase as any[]).map(p => ({ label: `alpha = ${p.alpha}`, value: p.N })) });
  }
  if (id === 'stable-expansion') {
    out.push({ id: 'survey', kind: 'bar', unit: 'percent stable', title: 'How often a random collapse reverses into a stable expansion',
      caption: 'Numerical, from a naive random search, not checked for duplicates. Stable expansions exist but are not the rule.',
      rows: (d.survey as any[]).map(s => ({ label: `${s.N} vortices (${s.stable} of ${s.converged})`, value: Number((100 * s.stable / s.converged).toFixed(1)) })) });
  }
  if (id === 'double-pendulum') {
    out.push({ id: 'entropy', kind: 'bar', unit: 'per return', title: 'Proved lower bounds on topological entropy',
      caption: 'Entropy of the return map on a compact invariant set, at three energies. Any positive value means chaos; these are proved lower bounds, so the true values are at least this large.',
      rows: (d.entropy as any[]).map(e => ({ label: `E = ${e.E}`, value: e.per_return })) });
  }
  if (id === 'cardiac-rings') {
    const rings = d.rings as { N: number; T_ms: string }[];
    const last = Number(rings[rings.length - 1].T_ms);
    out.push({ id: 'periods', kind: 'bar', unit: 'nanoseconds shorter', title: 'How much shorter the wave period is than for 64 cells',
      caption: 'Each period is enclosed to within 2e-25 ms. The differences shrink by about four times each time the ring doubles, as the rings approach the cable.',
      rows: rings.slice(0, -1).map(r => ({ label: `${r.N} cells`, value: Number(((last - Number(r.T_ms)) * 1e6).toFixed(1)) })) });
  }
  let html = out.map(barChart).join('');
  if (id === 'rank-window') html += rangeChart(d.sets as any[]);
  return html;
}

/** Exponent ranges against the smoothness bound, one row per stimulus set. One axis. */
function rangeChart(sets: { d: number; bound: number; reported: number; border_low: number | null; border_high: number }[]): string {
  const max = 4;
  const at = (x: number) => `${(100 * x / max).toFixed(2)}%`;
  const rows = sets.map(s => {
    const low = s.border_low ?? s.border_high;
    return `<div class="rs-row rs-range-row"><span class="rs-row-label">d = ${s.d}</span><span class="rs-track rs-range-track"><span class="rs-range" style="left:${at(low)};width:${at(s.border_high - low)}" data-tip="${escapeHTML(s.border_low === null ? `A non-differentiable code reaches ${s.border_high}` : `Codes at the differentiability border: ${s.border_low} to ${s.border_high}`)}" tabindex="0"></span><span class="rs-range-bound" style="left:${at(s.bound)}" data-tip="${escapeHTML(`Smoothness bound 1 + 2/d = ${s.bound}`)}" tabindex="0"></span><span class="rs-range-dot" style="left:${at(s.reported)}" data-tip="${escapeHTML(`Reported exponent ${s.reported}`)}" tabindex="0"></span></span><span class="rs-row-value">${s.bound}</span></div>`;
  }).join('');
  return `<figure class="rs-chart"><figcaption><h3>What window exponents can do at the border of smoothness</h3><p>Bars: exponents fitted over the papers' rank windows for model codes built exactly at the border of differentiability (for d = 1, a non-differentiable code). Line: the bound 1 + 2/d. Dot: the exponent reported for the recordings. A bar that crosses the line means a window fit cannot tell which side of the bound a code is on.</p></figcaption><div class="rs-bars">${rows}</div><ul class="rs-legend"><li><span class="rs-swatch" data-step="2" aria-hidden="true"></span>Border-code window exponents</li><li><span class="rs-legend-line" aria-hidden="true"></span>Smoothness bound</li><li><span class="rs-legend-dot" aria-hidden="true"></span>Reported exponent</li></ul><details class="rs-table-view"><summary>Show the numbers as a table</summary><div class="rs-scroll"><table><thead><tr><th scope="col">Stimulus dimension d</th><th scope="col">Bound</th><th scope="col">Reported</th><th scope="col">Border codes, low</th><th scope="col">Border codes, high</th></tr></thead><tbody>${sets.map(s => `<tr><td>${s.d}</td><td>${s.bound}</td><td>${s.reported}</td><td>${s.border_low ?? '·'}</td><td>${s.border_high}</td></tr>`).join('')}</tbody></table></div></details></figure>`;
}

function moduleHTML(e: Explainer): string {
  if (!e.module) return '';
  const d = data[e.id] as Record<string, any>;
  const intro = `<p class="section-intro">${escapeHTML(e.moduleIntro ?? '')}</p>`;
  const zoom = e.module === 'vortex' ? '<p class="editorial-note">The view zooms with the group, so a self-similar motion keeps the same picture while it shrinks or grows: the trails are logarithmic spirals.</p>' : '';
  if (e.module === 'vortex') {
    const sets: Record<string, { label: string; mode: 'collapse' | 'expand'; config: Config }> = {};
    const add = (key: string, label: string, mode: 'collapse' | 'expand', config: Config) => { sets[key] = { label, mode, config }; };
    if (e.id === 'minimal-winding') {
      const c = d.configs;
      add('n4', `4 vortices, P = ${fmt(c.n4.P)}`, 'collapse', c.n4); add('n5', `5 vortices, P = ${fmt(c.n5.P)}`, 'collapse', c.n5); add('n6', `6 vortices, P = ${fmt(c.n6.P)}`, 'collapse', c.n6);
      add('n12', `12 vortices, P = ${fmt(c.n12.P)}`, 'collapse', c.n12); add('n61', `61 vortices, P = ${fmt(c.n61.P)}`, 'collapse', c.n61);
    } else if (e.id === 'collapse-without-rotation') {
      const c = d.configs; const mw = (data['minimal-winding'] as any).configs;
      add('a2', '11 vortices, alpha = 2, P = 0', 'collapse', c['alpha2-n11']); add('sqg', '60 vortices, SQG, P = 0', 'collapse', c['sqg-n60']); add('n61', `61 ordinary vortices, P = ${fmt(mw.n61.P)}`, 'collapse', mw.n61);
    } else {
      const c = d.configs;
      add('s4', 'Four vortices, stable (certified)', 'expand', c.stable4); add('u4', 'Four vortices, unstable control', 'expand', c.unstable4);
      add('s5', 'Five vortices, stable (certified)', 'expand', c.stable5); add('u5', 'Five vortices, unstable control', 'expand', c.unstable5);
    }
    const options = Object.entries(sets).map(([k, s], i) => `<option value="${k}"${i === 0 ? ' selected' : ''}>${escapeHTML(s.label)}</option>`).join('');
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Run the vortices.</h2>${intro}<div class="pm-controls"><label>Configuration<select data-pm="config">${options}</select></label><button class="rs-chip" type="button" data-pm="play" aria-pressed="true">Pause</button><button class="rs-chip" type="button" data-pm="reset">Restart</button><button class="rs-chip" type="button" data-pm="nudge">Nudge</button></div><canvas class="pm-canvas" data-pm-vortex width="900" height="500" aria-label="Animated point vortices"></canvas>${zoom}<p class="rs-readout" data-pm="readout" role="status"></p><script type="application/json" data-pm-data>${json(sets)}</script></section>`;
  }
  if (e.module === 'pendulum') {
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Explore the section.</h2>${intro}<div class="pm-controls"><label>Energy<select data-pm="energy"><option value="-0.5">E = -1/2</option><option value="0" selected>E = 0 (released horizontal)</option><option value="0.5">E = 1/2</option><option value="-1.5">E = -3/2 (calmer, not in the paper)</option></select></label><button class="rs-chip" type="button" data-pm="clear">Clear</button></div><div class="pm-pair"><canvas class="pm-canvas" data-pm-pendulum width="420" height="420" aria-label="The double pendulum"></canvas><canvas class="pm-canvas pm-section" data-pm-section width="560" height="420" aria-label="Poincaré section. Click to start an orbit."></canvas></div><p class="rs-readout" data-pm="readout" role="status">Click inside the section to start an orbit.</p></section>`;
  }
  if (e.module === 'hh-neuron') {
    const h = d.hopf;
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Drive the membrane.</h2>${intro}<div class="pm-controls"><label class="pm-slider">Steady current J <output data-pm="jout">8.0</output> µA/cm²<input type="range" min="0" max="200" step="0.1" value="8" data-pm="j"/></label><button class="rs-chip" type="button" data-pm="kick">Kick (1 ms)</button><button class="rs-chip" type="button" data-pm="rest">Back to rest</button><button class="rs-chip" type="button" data-pm="play" aria-pressed="true">Pause</button></div><div class="pm-strip" aria-hidden="true"><span class="pm-strip-stable" style="width:${(100 * h.J_H1[0] / 200).toFixed(2)}%"></span><span class="pm-strip-unstable" style="width:${(100 * (h.J_H2[0] - h.J_H1[0]) / 200).toFixed(2)}%"></span><span class="pm-strip-stable" style="flex:1"></span><span class="pm-strip-mark" data-pm="mark"></span></div><p class="editorial-note">Rest is stable left of ${fmt(h.J_H1[0], 4)} and right of ${fmt(h.J_H2[0], 2)} µA/cm² (light), unstable between them (dark), proved. The current ramps gently when you move the slider, because a sudden jump is itself a kick.</p><canvas class="pm-canvas" data-pm-hh width="900" height="320" aria-label="Membrane voltage over the last 200 ms"></canvas><p class="rs-readout" data-pm="readout" role="status"></p><script type="application/json" data-pm-data>${json({ hopf: h })}</script></section>`;
  }
  if (e.module === 'hh-shoot') {
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Shoot the speed yourself.</h2>${intro}<div class="pm-controls"><label>Temperature<select data-pm="temp"><option value="18.5" selected>18.5 °C</option><option value="6.3">6.3 °C</option></select></label><label class="pm-k">Speed parameter K (1/ms)<input data-pm="k" value="10" inputmode="decimal" spellcheck="false"/></label><span class="pm-steps">${[1, 0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001].map(s => `<button class="rs-chip" type="button" data-step="${s}">±${s}</button>`).join('')}</span><button class="rs-chip" type="button" data-pm="auto">Bisect for me</button><button class="rs-chip" type="button" data-pm="reveal">Show the proved K</button></div><canvas class="pm-canvas" data-pm-shoot width="900" height="340" aria-label="Voltage of the shot solution"></canvas><p class="rs-readout" data-pm="readout" role="status"></p><script type="application/json" data-pm-data>${json(d.pulses)}</script></section>`;
  }
  if (e.module === 'neural-field') {
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Start a wave.</h2>${intro}<div class="pm-controls"><label class="pm-slider">Recovery rate ε <output data-pm="eout">0.10</output><input type="range" min="0.04" max="0.2" step="0.005" value="0.1" data-pm="eps"/></label><button class="rs-chip" type="button" data-pm="reset">Stimulate again</button><button class="rs-chip" type="button" data-pm="play" aria-pressed="true">Pause</button></div><canvas class="pm-canvas" data-pm-field width="900" height="300" aria-label="Activity u and recovery v along the ring"></canvas><ul class="rs-legend"><li><span class="rs-swatch" data-step="2" aria-hidden="true"></span>Activity u</li><li><span class="rs-legend-line" aria-hidden="true"></span>Recovery v</li></ul><p class="rs-readout" data-pm="readout" role="status"></p><script type="application/json" data-pm-data>${json({ fast: d.fast_speed, range: d.eps_range })}</script></section>`;
  }
  if (e.module === 'rank-window') {
    return `<section class="editorial-section rs-module pm-module" aria-labelledby="mod-title"><h2 id="mod-title">Fit a window yourself.</h2>${intro}<div class="pm-controls pm-grid">${[['head', 'Head exponent', 0.6, 2.5, 0.01, 1.15], ['tail', 'Tail exponent (decides smoothness)', 0.6, 3.5, 0.01, 2.2], ['brk', 'Break rank', 20, 3000, 1, 600], ['lo', 'Window from rank', 1, 2000, 1, 11], ['hi', 'Window to rank', 5, 5000, 1, 500]].map(([k, l, mn, mx, st, v]) => `<label class="pm-slider">${l} <output data-pm="${k}-out">${v}</output><input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-pm="${k}"${k === 'brk' || k === 'lo' || k === 'hi' ? ' data-log' : ''}/></label>`).join('')}</div><canvas class="pm-canvas" data-pm-rank width="900" height="400" aria-label="Eigenspectrum on a log-log plot with the fitted window"></canvas><p class="rs-readout" data-pm="readout" role="status"></p></section>`;
  }
  return '';
}

function results(e: Explainer): string {
  return `<ul class="pm-results">${e.results.map(r => `<li><span class="pm-label">${escapeHTML(r.label)}</span>${escapeHTML(r.text)}</li>`).join('')}</ul>`;
}

function page(e: Explainer): ContentPage | null {
  const paper = papers.find(p => p.id === e.id);
  const d = data[e.id];
  if (!paper || !d) return null;
  const plain = `<section class="rs-view" data-view="plain" aria-labelledby="plain-${e.id}"><h2 id="plain-${e.id}" class="rs-view-title">In plain words</h2><div class="rs-columns"><div><h3>What it is about</h3><p>${escapeHTML(e.plain.what)}</p><h3>What it found</h3><p>${escapeHTML(e.plain.found)}</p><h3>Why it matters</h3><p>${escapeHTML(e.plain.why)}</p><h3>What it does not claim</h3><p>${escapeHTML(e.plain.limits)}</p></div><aside class="rs-meter"><p class="rs-meter-lead">${escapeHTML(e.question)}</p><dl class="method-facts">${e.numbers.map(n => `<div><dt>${escapeHTML(n.label)}</dt><dd>${escapeHTML(n.value)}${n.note ? `<br/><span class="pm-note">${escapeHTML(n.note)}</span>` : ''}</dd></div>`).join('')}</dl><p class="editorial-note">A preprint: not yet peer reviewed.</p></aside></div><h3>Words used here</h3><dl class="rs-defs">${e.terms.map(t => `<div><dt>${escapeHTML(t.term)}</dt><dd>${escapeHTML(t.meaning)}</dd></div>`).join('')}</dl><h3>Questions people ask</h3>${e.faq.map(f => `<details class="rs-faq"><summary>${escapeHTML(f.q)}</summary><p>${escapeHTML(f.a)}</p></details>`).join('')}</section>`;
  const researcher = `<section class="rs-view" data-view="researcher" aria-labelledby="res-${e.id}"><h2 id="res-${e.id}" class="rs-view-title">For researchers</h2><h3>Abstract</h3><p class="pm-abstract">${escapeHTML(d.abstract)}</p><h3>Results and their status</h3>${results(e)}<div class="editorial-actions">${ext(paper.doi, 'Archived release and DOI')}${ext(paper.pdf, 'Read the PDF')}${ext(paper.source, 'Programs and data')}</div><p class="editorial-note">Data on this page are copied from ${escapeHTML(d.source.repository.replace('https://github.com/', ''))} at commit ${escapeHTML(d.source.commit.slice(0, 7))}.</p></section>`;
  const figs = d.figures.length ? `<section class="editorial-section"><h2>Figures from the paper.</h2><div class="pm-figures">${d.figures.map(f => `<figure><a href="${escapeHTML(f)}"><img src="${escapeHTML(f)}" alt="${escapeHTML(`Figure from ${paper.title}`)}" loading="lazy" decoding="async"/></a><figcaption>${escapeHTML(f.split('/').pop()!.replace(/\.(svg|png)$/, '').replace(/[-_]/g, ' '))}</figcaption></figure>`).join('')}</div></section>` : '';
  const chartHTML = charts(e.id);
  const others = explainers.filter(o => o.id !== e.id && papers.some(p => p.id === o.id));
  const body = `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/research/">Research</a><span aria-hidden="true">/</span><a href="/research/#papers">Papers</a><span aria-hidden="true">/</span><span>${escapeHTML(paper.title)}</span></nav><section class="editorial-hero"><p class="eyebrow">PREPRINT / ${escapeHTML(paper.category.toUpperCase())} / NOT YET PEER REVIEWED</p><h1 class="pm-title">${escapeHTML(paper.title)}</h1><p class="editorial-intro">${escapeHTML(e.question)} ${escapeHTML(paper.summary)}</p></section><div class="rs-switch" role="group" aria-label="Choose a view" hidden><button class="rs-chip" aria-pressed="true" data-view-button="plain">Plain language</button><button class="rs-chip" aria-pressed="false" data-view-button="researcher">Researcher view</button><button class="rs-chip" aria-pressed="false" data-view-button="both">Both</button></div><div class="rs-views">${plain}${researcher}</div>${moduleHTML(e)}${chartHTML ? `<section class="editorial-section"><h2>Charts.</h2>${chartHTML}</section>` : ''}${figs}<section class="editorial-section"><h2>Other papers.</h2><ul class="rs-case-list">${others.map(o => { const p = papers.find(x => x.id === o.id)!; return `<li><a href="${paperRoute(o.id)}">${escapeHTML(p.title)}</a><span>${escapeHTML(p.category)}</span></li>`; }).join('')}</ul>${ext('/research/', 'All research')}</section><div class="rs-tip" role="tooltip" hidden></div>`;
  return {
    route: paperRoute(e.id),
    title: `${e.searchName} | Hendrick Research`,
    description: `${e.question} ${e.plain.found}`.slice(0, 290).replace(/\s+\S*$/, '') + '…',
    body,
    schema: {
      '@type': 'WebPage',
      mainEntity: { '@type': 'ScholarlyArticle', headline: paper.title, abstract: d.abstract, genre: 'Preprint', url: paper.doi, sameAs: paper.source,
        author: { '@type': 'Person', name: 'Chase Hendrick', sameAs: 'https://orcid.org/0009-0002-9754-6087' },
        encoding: { '@type': 'MediaObject', contentUrl: paper.pdf, encodingFormat: 'application/pdf' }, isAccessibleForFree: true },
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Research', item: origin + '/research/' },
        { '@type': 'ListItem', position: 2, name: paper.title, item: origin + paperRoute(e.id) },
      ] },
    },
  };
}

export function paperPages(): ContentPage[] {
  return explainers.map(page).filter((p): p is ContentPage => p !== null);
}

export const hasExplainer = (id: string) => explainers.some(e => e.id === id) && id in data;
