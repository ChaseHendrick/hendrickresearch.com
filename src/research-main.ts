// Interactive layer for the undeciphered-texts research pages. The pages are complete without it.

const store = {
  get(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string): void { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
};

function press(group: Element, button: Element): void {
  group.querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
}

function views(): void {
  const switcher = document.querySelector<HTMLElement>('.rs-switch');
  const wrap = document.querySelector<HTMLElement>('.rs-views');
  if (!switcher || !wrap) return;
  switcher.hidden = false;
  const show = (view: string) => {
    wrap.dataset.show = view;
    const button = switcher.querySelector(`[data-view-button="${view}"]`);
    if (button) press(switcher, button);
  };
  show(store.get('research-view') ?? 'plain');
  switcher.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-view-button]');
    if (!button) return;
    show(button.dataset.viewButton!);
    store.set('research-view', button.dataset.viewButton!);
  });
}

function tooltips(): void {
  const tip = document.querySelector<HTMLElement>('.rs-tip');
  if (!tip) return;
  const place = (target: HTMLElement) => {
    tip.textContent = target.dataset.tip ?? '';
    tip.hidden = false;
    const box = target.getBoundingClientRect();
    const width = tip.offsetWidth;
    tip.style.left = `${Math.min(window.innerWidth - width - 8, Math.max(8, box.left + box.width / 2 - width / 2))}px`;
    tip.style.top = `${box.top - tip.offsetHeight - 8 < 8 ? box.bottom + 8 : box.top - tip.offsetHeight - 8}px`;
  };
  const hide = () => { tip.hidden = true; };
  document.addEventListener('pointerover', event => {
    const target = (event.target as Element).closest<HTMLElement>('[data-tip]');
    if (target) place(target); else hide();
  });
  document.addEventListener('focusin', event => {
    const target = (event.target as Element).closest<HTMLElement>('[data-tip]');
    if (target) place(target); else hide();
  });
  document.addEventListener('scroll', hide, { passive: true });
}

function charts(): void {
  document.querySelectorAll<HTMLElement>('.rs-chart[data-chart]').forEach(chart => {
    const more = chart.querySelector<HTMLButtonElement>('.rs-more');
    const bars = chart.querySelector<HTMLElement>('.rs-bars');
    more?.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      bars?.toggleAttribute('data-collapsed', !open);
      more.textContent = open ? 'Show fewer' : `Show all ${chart.querySelectorAll('.rs-row').length}`;
    });
    const group = chart.querySelector('.rs-chip-row');
    group?.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLElement>('[data-measure]');
      if (!button) return;
      press(group, button);
      const measure = button.dataset.measure!;
      const fills = [...chart.querySelectorAll<HTMLElement>('.rs-fill')];
      const values = fills.map(f => Number(measure === 'median' ? f.dataset.median : f.dataset.value) || 0);
      const max = Math.max(...values, 1);
      fills.forEach((fill, i) => {
        fill.style.width = `${Math.max(0.5, (100 * values[i]) / max).toFixed(2)}%`;
        const value = fill.closest('.rs-row')!.querySelector('.rs-row-value')!;
        value.textContent = values[i].toLocaleString('en-US');
      });
    });
  });
}

function familyFilter(): void {
  const group = document.querySelector('.rs-family-filter');
  if (!group) return;
  group.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-filter]');
    if (!button) return;
    press(group, button);
    const want = button.dataset.filter!;
    document.querySelectorAll<HTMLElement>('.rs-families tbody tr').forEach(row => { row.hidden = want !== 'all' && row.dataset.status !== want; });
  });
}

const PLAIN = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const ROWS = '67890';
const COLUMNS = '12345';

function fold(text: string): string {
  return text.normalize('NFD').toUpperCase().replace(/ß/g, 'SS').replace(/[^A-Z]/g, '').replace(/J/g, 'I');
}

function sortedCounts(symbols: number[]): number[] {
  const counts = new Array(25).fill(0);
  symbols.forEach(s => { counts[s] += 1; });
  return counts.sort((a, b) => b - a);
}

function grid(): void {
  const data = document.querySelector('#rs-cells');
  const box = document.querySelector<HTMLElement>('.rs-grid');
  if (!data?.textContent || !box) return;
  const cells = JSON.parse(data.textContent) as string[];
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('.rs-cell')];
  const readout = document.querySelector('#rs-grid-readout')!;
  const input = document.querySelector<HTMLInputElement>('#rs-square')!;
  const width = Number(box.dataset.width);
  let mode = 'pairs';
  const square = () => {
    const letters = [...new Set(fold(input.value))].filter(ch => PLAIN.includes(ch));
    for (const ch of PLAIN) if (!letters.includes(ch)) letters.push(ch);
    return letters.slice(0, 25);
  };
  const letterOf = (pair: string, sq: string[]) => sq[ROWS.indexOf(pair[0]) * 5 + COLUMNS.indexOf(pair[1])] ?? '?';
  const render = () => {
    const sq = square();
    buttons.forEach((b, i) => { b.textContent = mode === 'pairs' ? cells[i] : letterOf(cells[i], sq); });
  };
  box.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('.rs-cell');
    if (!button) return;
    const cell = button.dataset.cell!;
    const places = buttons.filter(b => b.dataset.cell === cell);
    buttons.forEach(b => b.classList.toggle('rs-cell-on', b.dataset.cell === cell));
    const where = places.map(b => { const i = Number(b.dataset.i); return `r${Math.floor(i / width) + 1}c${(i % width) + 1}`; });
    readout.textContent = `${cell} appears ${places.length} time${places.length === 1 ? '' : 's'}${mode === 'letters' ? `, as ${letterOf(cell, square())} under your square` : ''}: ${where.join(', ')}.`;
  });
  document.querySelector('.rs-grid-tools')!.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-show],[data-heat-toggle]');
    if (!button) return;
    if (button.hasAttribute('data-heat-toggle')) {
      const on = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(on));
      box.toggleAttribute('data-heat-on', on);
      return;
    }
    mode = button.dataset.show!;
    button.parentElement!.querySelectorAll('[data-show]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  });
  input.addEventListener('input', () => { if (mode === 'letters') render(); });

  const run = document.querySelector('#rs-fit-run');
  const text = document.querySelector<HTMLTextAreaElement>('#rs-fit-text');
  const out = document.querySelector('#rs-fit-readout');
  if (!run || !text || !out) return;
  const target = sortedCounts(cells.map(pair => ROWS.indexOf(pair[0]) * 5 + COLUMNS.indexOf(pair[1])));
  const n = cells.length;
  run.addEventListener('click', () => {
    const letters = fold(text.value).slice(0, 400_000);
    if (letters.length < n) { out.textContent = `That is ${letters.length} letters after removing spaces and punctuation; at least ${n} are needed.`; return; }
    const symbols = [...letters].map(ch => PLAIN.indexOf(ch));
    const counts = new Array(25).fill(0);
    for (let i = 0; i < n; i++) counts[symbols[i]] += 1;
    let best = Infinity, bestAt = 0, sum = 0, windows = 0;
    for (let start = 0; ; start++) {
      const sorted = [...counts].sort((a, b) => b - a);
      let distance = 0;
      for (let k = 0; k < 25; k++) distance += Math.abs(sorted[k] - target[k]);
      const errors = distance / 2;
      sum += errors; windows += 1;
      if (errors < best) { best = errors; bestAt = start; }
      if (start + n >= symbols.length) break;
      counts[symbols[start]] -= 1;
      counts[symbols[start + n]] += 1;
    }
    const verdict = best === 0 ? 'That stretch has exactly the cells\' letter counts, which nothing in 8.9 million letters of Latin did.' : best < 4 ? 'Closer than anything found in 8.9 million letters of Latin.' : best === 4 ? 'As close as the best Latin found so far.' : best <= 8 ? 'About as close as the best English.' : 'Further away than ordinary English or Latin.';
    out.textContent = `${letters.length.toLocaleString('en-US')} letters, ${windows.toLocaleString('en-US')} windows. The closest window starts at letter ${bestAt + 1} and needs ${best} wrong cell${best === 1 ? '' : 's'}; the average window needs ${(sum / windows).toFixed(1)}. ${verdict} A close fit is a reason to search, not a reading.`;
  });
}

function k4(): void {
  const strip = document.querySelector<HTMLElement>('.rs-k4-strip');
  const group = strip?.parentElement?.querySelector('.rs-chip-row');
  if (!strip || !group) return;
  group.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-hold]');
    if (!button) return;
    press(group, button);
    strip.dataset.hold = button.dataset.hold!;
  });
}

export function mountResearch(): void {
  if (!document.querySelector('.rs-views, .rs-overview, .rs-cards')) return;
  document.documentElement.classList.add('js-research');
  views();
  tooltips();
  charts();
  familyFilter();
  grid();
  k4();
}
