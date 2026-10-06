// Interactive models for the paper explainer pages. Each integrates the paper's own equations in
// ordinary floating point; none is part of any proof, and each says so on the page.

type Config = { N: number; alpha: number; z: number[][]; G: number[]; P?: number };

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const dark = () => document.documentElement.dataset.theme === 'dark';
const series = () => (dark() ? ['#3987e5', '#d95926'] : ['#2a78d6', '#eb6834']);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function fit(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || Number(canvas.getAttribute('width'));
  const height = width * Number(canvas.getAttribute('height')) / Number(canvas.getAttribute('width'));
  if (canvas.width !== Math.round(width * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}
const size = (canvas: HTMLCanvasElement) => ({ w: canvas.width / Math.min(2, window.devicePixelRatio || 1), h: canvas.height / Math.min(2, window.devicePixelRatio || 1) });

function loop(step: () => void, running: () => boolean): void {
  let visible = true;
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(document.querySelector('.pm-module')!);
  const frame = () => { if (visible && running() && !document.hidden) step(); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}

function toggle(button: HTMLElement | null, state: { running: boolean }): void {
  button?.addEventListener('click', () => {
    state.running = !state.running;
    button.setAttribute('aria-pressed', String(state.running));
    button.textContent = state.running ? 'Pause' : 'Play';
  });
  if (reduced() && button) { state.running = false; button.setAttribute('aria-pressed', 'false'); button.textContent = 'Play'; }
}

/* Point vortices: z_k' = (i / 2 pi) sum_j G_j (z_k - z_j) / |z_k - z_j|^(alpha + 2). */
function vortex(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pm-vortex]')!;
  const sets = JSON.parse(root.querySelector('[data-pm-data]')!.textContent!) as Record<string, { label: string; mode: 'collapse' | 'expand'; config: Config }>;
  const select = root.querySelector<HTMLSelectElement>('[data-pm="config"]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  const state = { running: true };
  toggle(root.querySelector('[data-pm="play"]'), state);
  let n = 0, alpha = 0, G: number[] = [], x = new Float64Array(0), y = new Float64Array(0), dir = 1;
  let mode: 'collapse' | 'expand' = 'collapse', trails: number[][] = [], held = NaN, left = false, s0 = 0, theta0 = 0, thetaPrev = 0, turns = 0, ref = 0, w0: number[][] = [], t = 0, done = 0, P: number | undefined;
  const centre = () => {
    const total = G.reduce((a, b) => a + b, 0);
    let cx = 0, cy = 0;
    if (Math.abs(total) > 1e-9) { for (let k = 0; k < n; k++) { cx += G[k] * x[k]; cy += G[k] * y[k]; } return [cx / total, cy / total]; }
    for (let k = 0; k < n; k++) { cx += x[k]; cy += y[k]; }
    return [cx / n, cy / n];
  };
  const r2 = () => { const [cx, cy] = centre(); let s = 0; for (let k = 0; k < n; k++) s += (x[k] - cx) ** 2 + (y[k] - cy) ** 2; return s / n; };
  const velocity = (px: Float64Array, py: Float64Array, u: Float64Array, v: Float64Array) => {
    const e = (alpha + 2) / 2;
    for (let k = 0; k < n; k++) {
      let a = 0, b = 0;
      for (let j = 0; j < n; j++) {
        if (j === k) continue;
        const dx = px[k] - px[j], dy = py[k] - py[j];
        const f = G[j] / (2 * Math.PI * Math.pow(dx * dx + dy * dy, e));
        a -= f * dy; b += f * dx;
      }
      u[k] = a; v[k] = b;
    }
  };
  const k1x = new Float64Array(64), k1y = new Float64Array(64), k2x = new Float64Array(64), k2y = new Float64Array(64), k3x = new Float64Array(64), k3y = new Float64Array(64), k4x = new Float64Array(64), k4y = new Float64Array(64), tx = new Float64Array(64), ty = new Float64Array(64);
  const step = (dt: number) => {
    velocity(x, y, k1x, k1y);
    for (let k = 0; k < n; k++) { tx[k] = x[k] + dt / 2 * k1x[k]; ty[k] = y[k] + dt / 2 * k1y[k]; }
    velocity(tx, ty, k2x, k2y);
    for (let k = 0; k < n; k++) { tx[k] = x[k] + dt / 2 * k2x[k]; ty[k] = y[k] + dt / 2 * k2y[k]; }
    velocity(tx, ty, k3x, k3y);
    for (let k = 0; k < n; k++) { tx[k] = x[k] + dt * k3x[k]; ty[k] = y[k] + dt * k3y[k]; }
    velocity(tx, ty, k4x, k4y);
    for (let k = 0; k < n; k++) { x[k] += dt / 6 * (k1x[k] + 2 * k2x[k] + 2 * k3x[k] + k4x[k]); y[k] += dt / 6 * (k1y[k] + 2 * k2y[k] + 2 * k3y[k] + k4y[k]); }
  };
  const dtNow = () => {
    let dmin = Infinity;
    for (let k = 0; k < n; k++) for (let j = k + 1; j < n; j++) dmin = Math.min(dmin, Math.hypot(x[k] - x[j], y[k] - y[j]));
    const gmax = Math.max(...G.map(Math.abs));
    return dir * 0.01 * 2 * Math.PI * Math.pow(dmin, alpha + 2) / gmax;
  };
  const angle = () => { const [cx, cy] = centre(); return Math.atan2(y[ref] - cy, x[ref] - cx); };
  const shape = () => {
    const [cx, cy] = centre();
    const rx = x[ref] - cx, ry = y[ref] - cy, rr = rx * rx + ry * ry;
    return Array.from({ length: n }, (_, k) => { const ax = x[k] - cx, ay = y[k] - cy; return [(ax * rx + ay * ry) / rr, (ay * rx - ax * ry) / rr]; });
  };
  const load = () => {
    const set = sets[select.value];
    const c = set.config;
    n = c.N; alpha = c.alpha; G = c.G.slice(); P = c.P; mode = set.mode;
    x = Float64Array.from(c.z.map(p => p[0])); y = Float64Array.from(c.z.map(p => p[1]));
    const [cx, cy] = centre();
    for (let k = 0; k < n; k++) { x[k] -= cx; y[k] -= cy; }
    let best = 0;
    for (let k = 0; k < n; k++) if (Math.hypot(x[k], y[k]) > Math.hypot(x[best], y[best])) best = k;
    ref = best;
    velocity(x, y, k1x, k1y);
    let rate = 0;
    for (let k = 0; k < n; k++) rate += x[k] * k1x[k] + y[k] * k1y[k];
    dir = (mode === 'collapse') === (rate < 0) ? 1 : -1;
    trails = Array.from({ length: n }, () => []);
    s0 = Math.log(r2()); theta0 = thetaPrev = angle(); turns = 0; w0 = shape(); t = 0; done = 0; held = NaN; left = false;
  };
  const nudge = () => {
    const r = Math.sqrt(r2());
    for (let k = 0; k < n; k++) { x[k] += 0.02 * r * (Math.random() - 0.5); y[k] += 0.02 * r * (Math.random() - 0.5); }
  };
  const draw = () => {
    const ctx = fit(canvas); const { w, h } = size(canvas);
    ctx.clearRect(0, 0, w, h);
    const scale = Math.sqrt(r2()) * 2.6;
    const unit = Math.min(w, h) / 2 / scale;
    const [cx, cy] = centre();
    const X = (px: number) => w / 2 + (px - cx) * unit, Y = (py: number) => h / 2 - (py - cy) * unit;
    ctx.strokeStyle = css('--line'); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2 - 6, h / 2); ctx.lineTo(w / 2 + 6, h / 2); ctx.moveTo(w / 2, h / 2 - 6); ctx.lineTo(w / 2, h / 2 + 6); ctx.stroke();
    const [pos, neg] = series();
    const gmax = Math.max(...G.map(Math.abs));
    for (let k = 0; k < n; k++) {
      const trail = trails[k];
      ctx.strokeStyle = G[k] > 0 ? pos : neg; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < trail.length; i += 2) { const px = X(trail[i]), py = Y(trail[i + 1]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    for (let k = 0; k < n; k++) {
      const radius = Math.max(2.5, 7 * Math.sqrt(Math.abs(G[k]) / gmax));
      ctx.fillStyle = G[k] > 0 ? pos : neg; ctx.strokeStyle = css('--paper'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(x[k]), Y(y[k]), radius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = css('--muted'); ctx.font = '12px DM Sans, sans-serif';
    ctx.fillText('● spins one way   ● the other way (size shows strength)', 12, h - 12);
    ctx.fillStyle = pos; ctx.fillText('●', 12, h - 12); ctx.fillStyle = neg; ctx.fillText('●', 123, h - 12);
  };
  const advance = () => {
    if (done) { if (performance.now() - done > 1600) load(); draw(); return; }
    const sStart = Math.log(r2());
    for (let i = 0; i < 900; i++) {
      const dt = dtNow();
      step(dt); t += dt;
      const th = angle();
      let d = th - thetaPrev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      turns += d; thetaPrev = th;
      if (Math.abs(Math.log(r2()) - sStart) > 0.02) break;
    }
    for (let k = 0; k < n; k++) { trails[k].push(x[k], y[k]); if (trails[k].length > 3000) trails[k].splice(0, 2); }
    const s = Math.log(r2());
    const measured = Math.abs(s - s0) > 0.05 ? Math.abs(turns / (s - s0)) : NaN;
    const now = shape();
    const err = Math.sqrt(now.reduce((a, p, k) => a + (p[0] - w0[k][0]) ** 2 + (p[1] - w0[k][1]) ** 2, 0) / n);
    const shrink = Math.exp((s - s0) / 2);
    if (err < 1e-3 && !Number.isNaN(measured)) held = measured;
    if (err > 0.02) left = true;
    const leftNote = left ? ' Rounding errors have grown and pulled the vortices off the exact motion, as they do for an unstable configuration; nudging does the same on purpose.' : '';
    readout.textContent = `${n} vortices${alpha ? `, alpha = ${alpha}` : ''}. Size ${mode === 'collapse' ? 'down' : 'up'} to ${shrink < 1e-3 || shrink > 1e3 ? shrink.toExponential(1) : shrink.toFixed(3)} of the start. Winding measured while the shape held: ${Number.isNaN(held) ? '…' : held.toFixed(4)}${P !== undefined ? ` (paper: ${P.toFixed(4)})` : ''}. Shape error ${err < 1e-4 ? err.toExponential(1) : err.toFixed(4)}.${leftNote}`;
    if ((mode === 'collapse' && s - s0 < -14) || (mode === 'expand' && s - s0 > 9) || (mode === 'collapse' && err > 0.6) || !Number.isFinite(s)) done = performance.now();
    draw();
  };
  select.addEventListener('change', load);
  root.querySelector('[data-pm="reset"]')?.addEventListener('click', load);
  root.querySelector('[data-pm="nudge"]')?.addEventListener('click', nudge);
  load(); draw();
  loop(advance, () => state.running);
}

/* The double pendulum, m = l = g = 1: H = (p1^2 + 2 p2^2 - 2 c p1 p2) / (2 D) - 2 cos q1 - cos q2. */
function pendulum(root: HTMLElement): void {
  const art = root.querySelector<HTMLCanvasElement>('[data-pm-pendulum]')!;
  const section = root.querySelector<HTMLCanvasElement>('[data-pm-section]')!;
  const energy = root.querySelector<HTMLSelectElement>('[data-pm="energy"]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  let E = Number(energy.value);
  let s: number[] | null = null;
  let orbits: number[][] = [];
  const field = (q: number[]) => {
    const [a, b, p1, p2] = q;
    const c = Math.cos(a - b), sn = Math.sin(a - b), D = 2 - c * c;
    const A = (p1 * p1 + 2 * p2 * p2 - 2 * c * p1 * p2) / 2;
    const K = p1 * p2 * sn / D - 2 * A * c * sn / (D * D);
    return [(p1 - c * p2) / D, (2 * p2 - c * p1) / D, -K - 2 * Math.sin(a), K - Math.sin(b)];
  };
  const H = (q: number[]) => { const c = Math.cos(q[0] - q[1]), D = 2 - c * c; return (q[2] ** 2 + 2 * q[3] ** 2 - 2 * c * q[2] * q[3]) / (2 * D) - 2 * Math.cos(q[0]) - Math.cos(q[1]); };
  const rk4 = (q: number[], dt: number) => {
    const k1 = field(q), k2 = field(q.map((v, i) => v + dt / 2 * k1[i])), k3 = field(q.map((v, i) => v + dt / 2 * k2[i])), k4 = field(q.map((v, i) => v + dt * k3[i]));
    return q.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
  const pmax = () => Math.sqrt(2 * (E + 3));
  const toSection = (event: MouseEvent) => {
    const box = section.getBoundingClientRect();
    const th = -Math.PI + 2 * Math.PI * (event.clientX - box.left) / box.width;
    const p2 = pmax() * (1 - 2 * (event.clientY - box.top) / box.height) * 1.08;
    return [th, p2];
  };
  const start = (th: number, p2: number) => {
    const room = 2 * (E + 2 + Math.cos(th)) - p2 * p2;
    if (room <= 0) { readout.textContent = 'That point is outside the energy level; click inside the outlined region.'; return; }
    const c = Math.cos(th), D = 2 - c * c;
    s = [0, th, c * p2 + Math.sqrt(D * room), p2];
    orbits.push([]);
  };
  const drawSection = () => {
    const ctx = fit(section); const { w, h } = size(section);
    ctx.clearRect(0, 0, w, h);
    const X = (th: number) => (th + Math.PI) / (2 * Math.PI) * w, Y = (p: number) => h / 2 - p / (pmax() * 1.08) * h / 2;
    ctx.strokeStyle = css('--line-strong'); ctx.lineWidth = 1;
    for (const sign of [1, -1]) { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const th = -Math.PI + 2 * Math.PI * i / 200; const p = sign * Math.sqrt(Math.max(0, 2 * (E + 2 + Math.cos(th)))); if (i) ctx.lineTo(X(th), Y(p)); else ctx.moveTo(X(th), Y(p)); } ctx.stroke(); }
    const [blue] = series();
    orbits.forEach((orbit, k) => {
      ctx.fillStyle = k === orbits.length - 1 ? blue : css('--ink'); ctx.globalAlpha = k === orbits.length - 1 ? 1 : 0.35;
      for (let i = 0; i < orbit.length; i += 2) ctx.fillRect(X(orbit[i]) - 1, Y(orbit[i + 1]) - 1, 2, 2);
    });
    ctx.globalAlpha = 1; ctx.fillStyle = css('--muted'); ctx.font = '12px DM Sans, sans-serif';
    ctx.fillText('lower arm angle →', w - 118, h - 8); ctx.fillText('lower arm momentum', 8, 16);
  };
  const drawArt = () => {
    const ctx = fit(art); const { w, h } = size(art);
    ctx.clearRect(0, 0, w, h);
    if (!s) return;
    const L = Math.min(w, h) / 4.6, ox = w / 2, oy = h / 2;
    const x1 = ox + L * Math.sin(s[0]), y1 = oy + L * Math.cos(s[0]), x2 = x1 + L * Math.sin(s[1]), y2 = y1 + L * Math.cos(s[1]);
    ctx.strokeStyle = css('--ink'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const [blue] = series(); ctx.fillStyle = blue;
    for (const [px, py] of [[x1, y1], [x2, y2]]) { ctx.beginPath(); ctx.arc(px, py, 7, 0, 2 * Math.PI); ctx.fill(); }
    ctx.fillStyle = css('--ink'); ctx.beginPath(); ctx.arc(ox, oy, 3, 0, 2 * Math.PI); ctx.fill();
  };
  const state = { running: true };
  const advance = () => {
    if (s) {
      const orbit = orbits[orbits.length - 1];
      for (let i = 0; i < 120; i++) {
        const next = rk4(s, 0.005);
        const before = wrap(s[0]), after = wrap(next[0]);
        if (before < 0 && after >= 0 && after - before < 1) { const f = -before / (after - before); orbit.push(wrap(s[1] + f * (next[1] - s[1])), s[3] + f * (next[3] - s[3])); }
        s = next;
      }
      readout.textContent = `${orbits.length} orbit${orbits.length === 1 ? '' : 's'}; ${orbit.length / 2} crossings on this one. Energy drift ${Math.abs(H(s) - E).toExponential(1)}.`;
    }
    drawSection(); drawArt();
  };
  section.addEventListener('click', event => { const [th, p2] = toSection(event); start(th, p2); });
  energy.addEventListener('change', () => { E = Number(energy.value); orbits = []; s = null; readout.textContent = 'Click inside the section to start an orbit.'; drawSection(); drawArt(); });
  root.querySelector('[data-pm="clear"]')?.addEventListener('click', () => { orbits = []; s = null; drawSection(); drawArt(); });
  start(0.4, 0.2);
  loop(advance, () => state.running);
}

/* Hodgkin and Huxley's rates in the depolarization convention, 6.3 degrees, E_l = 10.613 mV. */
const psi = (x: number) => (Math.abs(x) < 1e-6 ? 1 - x / 2 : x > 700 ? x * Math.exp(-x) : x < -700 ? -x : x / Math.expm1(x));
const cap = (x: number) => Math.min(700, x);
function rates(u: number) {
  return [psi((25 - u) / 10), 4 * Math.exp(cap(-u / 18)), 0.1 * psi((10 - u) / 10), 0.125 * Math.exp(cap(-u / 80)), 0.07 * Math.exp(cap(-u / 20)), 1 / (Math.exp(cap((30 - u) / 10)) + 1)];
}
const ionic = (u: number, m: number, n: number, h: number) => 120 * m ** 3 * h * (u - 115) + 36 * n ** 4 * (u + 12) + 0.3 * (u - 10.613);
const gates = (u: number) => { const [am, bm, an, bn, ah, bh] = rates(u); return [am / (am + bm), an / (an + bn), ah / (ah + bh)]; };
const steady = (u: number) => { const [m, n, h] = gates(u); return ionic(u, m, n, h); };

function trace(canvas: HTMLCanvasElement, values: ArrayLike<number>, lo: number, hi: number, label: string, marks: number[] = []): void {
  const ctx = fit(canvas); const { w, h } = size(canvas);
  ctx.clearRect(0, 0, w, h);
  const Y = (v: number) => h - 24 - (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo) * (h - 40);
  ctx.strokeStyle = css('--line'); ctx.lineWidth = 1; ctx.fillStyle = css('--muted'); ctx.font = '12px DM Sans, sans-serif';
  for (const m of marks) { ctx.beginPath(); ctx.moveTo(40, Y(m)); ctx.lineTo(w, Y(m)); ctx.stroke(); ctx.fillText(String(m), 4, Y(m) + 4); }
  ctx.fillText(label, 44, 14);
  ctx.strokeStyle = series()[0]; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i < values.length; i++) { const px = 40 + i / (values.length - 1) * (w - 44); if (i) ctx.lineTo(px, Y(values[i])); else ctx.moveTo(px, Y(values[i])); }
  ctx.stroke();
}

function hhNeuron(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pm-hh]')!;
  const slider = root.querySelector<HTMLInputElement>('[data-pm="j"]')!;
  const out = root.querySelector('[data-pm="jout"]')!;
  const mark = root.querySelector<HTMLElement>('[data-pm="mark"]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  const dt = 0.01, window_ms = 200, every = 10;
  const buffer = new Float64Array(window_ms / (dt * every));
  let target = Number(slider.value), J = target, kickUntil = -1, t = 0, y = [0, 0, 0, 0], spikes: number[] = [], prev = 0, sample = 0;
  const rest = () => {
    let u = 0;
    for (let i = 0; i < 60; i++) { const d = (steady(u + 1e-6) - steady(u - 1e-6)) / 2e-6; u -= (steady(u) - J) / d; }
    y = [u, ...gates(u)]; spikes = []; buffer.fill(u);
  };
  const f = (q: number[], current: number) => {
    const [u, m, n, h] = q; const [am, bm, an, bn, ah, bh] = rates(u);
    return [current - ionic(u, m, n, h), am * (1 - m) - bm * m, an * (1 - n) - bn * n, ah * (1 - h) - bh * h];
  };
  const step = () => {
    J += (target - J) * dt / 20;
    const current = J + (t < kickUntil ? 20 : 0);
    const k1 = f(y, current), k2 = f(y.map((v, i) => v + dt / 2 * k1[i]), current), k3 = f(y.map((v, i) => v + dt / 2 * k2[i]), current), k4 = f(y.map((v, i) => v + dt * k3[i]), current);
    y = y.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += dt;
    if (prev < 50 && y[0] >= 50) spikes.push(t);
    prev = y[0];
    if (++sample % every === 0) { buffer.copyWithin(0, 1); buffer[buffer.length - 1] = y[0]; }
  };
  const state = { running: true };
  toggle(root.querySelector('[data-pm="play"]'), state);
  const advance = () => {
    for (let i = 0; i < 200; i++) step();
    spikes = spikes.filter(s => s > t - window_ms);
    const gaps = spikes.slice(1).map((s, i) => s - spikes[i]);
    const recent = gaps.slice(-3);
    readout.textContent = `J = ${J.toFixed(1)} µA/cm². ${spikes.length >= 3 && t - spikes[spikes.length - 1] < 40 ? `Firing, one spike every ${(recent.reduce((a, b) => a + b, 0) / recent.length).toFixed(2)} ms.` : 'At rest.'}${Math.abs(target - 8) < 0.05 ? ' At J = 8 both rest and firing are stable: a kick switches between them.' : ''}`;
    trace(canvas, buffer, -20, 120, 'Voltage, mV above rest, last 200 ms', [0, 50, 100]);
  };
  slider.addEventListener('input', () => { target = Number(slider.value); out.textContent = target.toFixed(1); mark.style.left = `${(100 * target / 200).toFixed(2)}%`; });
  root.querySelector('[data-pm="kick"]')?.addEventListener('click', () => { kickUntil = t + 1; });
  root.querySelector('[data-pm="rest"]')?.addEventListener('click', () => { J = target; rest(); });
  mark.style.left = `${(100 * target / 200).toFixed(2)}%`;
  rest();
  loop(advance, () => state.running);
}

function hhShoot(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pm-shoot]')!;
  const pulses = JSON.parse(root.querySelector('[data-pm-data]')!.textContent!) as Record<string, { K: string; lambda_u: number; t_end: number }>;
  const temp = root.querySelector<HTMLSelectElement>('[data-pm="temp"]')!;
  const input = root.querySelector<HTMLInputElement>('[data-pm="k"]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  const speed = (K: number) => Math.sqrt(K * 1e3 * 0.0238 / (2 * 35.4 * 1e-6)) / 100;
  const shoot = (K: number, T: number, tEnd: number, lambda: number) => {
    const phi = Math.pow(3, (T - 6.3) / 10);
    let u0 = 0;
    for (let i = 0; i < 60; i++) { const d = (steady(u0 + 1e-6) - steady(u0 - 1e-6)) / 2e-6; u0 -= steady(u0) / d; }
    let q = [u0 + 1e-6, lambda * 1e-6, ...gates(u0)];
    const f = (s: number[]) => { const [u, w, m, n, h] = s; const [am, bm, an, bn, ah, bh] = rates(u); return [w, K * (w + ionic(u, m, n, h)), phi * (am * (1 - m) - bm * m), phi * (an * (1 - n) - bn * n), phi * (ah * (1 - h) - bh * h)]; };
    const dt = 0.002, path: number[] = [];
    let t = 0, escape = 0;
    while (t < tEnd) {
      const k1 = f(q), k2 = f(q.map((v, i) => v + dt / 2 * k1[i])), k3 = f(q.map((v, i) => v + dt / 2 * k2[i])), k4 = f(q.map((v, i) => v + dt * k3[i]));
      q = q.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      t += dt;
      if (Math.round(t / dt) % 10 === 0) path.push(q[0]);
      if (!Number.isFinite(q[0]) || q[0] > 125 || q[0] < -25) { escape = q[0] > 0 ? 1 : -1; break; }
    }
    return { escape, t, path };
  };
  const run = (K: number) => {
    const T = Number(temp.value), rec = pulses[temp.value];
    const result = shoot(K, T, rec.t_end, rec.lambda_u);
    const path = result.path.concat(new Array(Math.max(0, Math.round(rec.t_end / 0.02) - result.path.length)).fill(result.escape > 0 ? 125 : result.escape < 0 ? -25 : result.path[result.path.length - 1]));
    trace(canvas, path, -30, 130, `Voltage of the shot solution, mV above rest, over ${rec.t_end} ms`, [0, 50, 100]);
    readout.textContent = `K = ${K} gives a speed of ${speed(K).toFixed(4)} m/s. ${result.escape > 0 ? `Too fast: the voltage runs away upward, past 125 mV, at ${result.t.toFixed(2)} ms.` : result.escape < 0 ? `Too slow: the voltage plunges below rest, past -25 mV, at ${result.t.toFixed(2)} ms.` : 'The solution stayed bounded to the end of the run: close to the pulse.'}`;
    return result.escape;
  };
  const current = () => Number(input.value) || 0;
  root.querySelectorAll<HTMLElement>('[data-step]').forEach(button => button.addEventListener('click', event => {
    const stepSize = Number(button.dataset.step);
    const sign = (event as MouseEvent).shiftKey ? -1 : run(current()) > 0 ? -1 : 1;
    input.value = String(Number((current() + sign * stepSize).toFixed(7)));
    run(current());
  }));
  input.addEventListener('change', () => run(current()));
  temp.addEventListener('change', () => { input.value = temp.value === '6.3' ? '4' : '10'; run(current()); });
  root.querySelector('[data-pm="auto"]')?.addEventListener('click', () => {
    let lo = temp.value === '6.3' ? 3 : 8, hi = temp.value === '6.3' ? 6 : 13, i = 0;
    const next = () => {
      const mid = (lo + hi) / 2;
      input.value = mid.toFixed(8);
      if (run(mid) > 0) hi = mid; else lo = mid;
      if (++i < 24) setTimeout(next, 120);
    };
    next();
  });
  root.querySelector('[data-pm="reveal"]')?.addEventListener('click', () => {
    const rec = pulses[temp.value];
    input.value = rec.K.slice(0, 12);
    run(Number(rec.K));
    readout.textContent += ` The proved K begins ${rec.K.slice(0, 48)}.`;
  });
  run(current());
}

/* Pinto-Ermentrout on a ring: u_t = -u - v + w * S(u), v_t = eps u, w = exp(-|x|) / 2. */
function neuralField(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pm-field]')!;
  const slider = root.querySelector<HTMLInputElement>('[data-pm="eps"]')!;
  const out = root.querySelector('[data-pm="eout"]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  const info = JSON.parse(root.querySelector('[data-pm-data]')!.textContent!) as { fast: string; range: number[] };
  const N = 600, L = 120, dx = L / N, decay = Math.exp(-dx);
  const S = (u: number) => 1 / (1 + Math.exp(-20 * (u - 0.25)));
  let eps = Number(slider.value), u = new Float64Array(N), v = new Float64Array(N), t = 0, fronts: number[][] = [], lastFront = 0, wraps = 0;
  const conv = (s: Float64Array, q: Float64Array) => {
    let a = 0; const fwd = new Float64Array(N);
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) { a = s[i] * dx + decay * a; if (pass) fwd[i] = a; }
    let b = 0;
    for (let pass = 0; pass < 2; pass++) for (let i = N - 1; i >= 0; i--) { b = s[i] * dx + decay * b; if (pass) q[i] = (fwd[i] + b - s[i] * dx) / 2; }
  };
  const su = new Float64Array(N), q = new Float64Array(N);
  const rhs = (pu: Float64Array, pv: Float64Array, du: Float64Array, dv: Float64Array) => {
    for (let i = 0; i < N; i++) su[i] = S(pu[i]);
    conv(su, q);
    for (let i = 0; i < N; i++) { du[i] = -pu[i] - pv[i] + q[i]; dv[i] = eps * pu[i]; }
  };
  const k = Array.from({ length: 8 }, () => new Float64Array(N)), tu = new Float64Array(N), tv = new Float64Array(N);
  const step = (dt: number) => {
    rhs(u, v, k[0], k[1]);
    for (let i = 0; i < N; i++) { tu[i] = u[i] + dt / 2 * k[0][i]; tv[i] = v[i] + dt / 2 * k[1][i]; }
    rhs(tu, tv, k[2], k[3]);
    for (let i = 0; i < N; i++) { tu[i] = u[i] + dt / 2 * k[2][i]; tv[i] = v[i] + dt / 2 * k[3][i]; }
    rhs(tu, tv, k[4], k[5]);
    for (let i = 0; i < N; i++) { tu[i] = u[i] + dt * k[4][i]; tv[i] = v[i] + dt * k[5][i]; }
    rhs(tu, tv, k[6], k[7]);
    for (let i = 0; i < N; i++) { u[i] += dt / 6 * (k[0][i] + 2 * k[2][i] + 2 * k[4][i] + k[6][i]); v[i] += dt / 6 * (k[1][i] + 2 * k[3][i] + 2 * k[5][i] + k[7][i]); }
    t += dt;
  };
  const reset = () => {
    u = new Float64Array(N); v = new Float64Array(N).fill(S(0)); t = 0; fronts = []; wraps = 0; lastFront = 0;
    for (let i = 0; i < N; i++) { const x = i * dx; if (x >= 5 && x < 10) u[i] = 1; if (x < 5) v[i] = 1; }
  };
  const front = () => {
    let best = -1;
    for (let i = 0; i < N; i++) if (u[i] > 0.25 && u[(i + 1) % N] <= 0.25) best = i;
    return best < 0 ? null : best * dx;
  };
  const draw = () => {
    const ctx = fit(canvas); const { w, h } = size(canvas);
    ctx.clearRect(0, 0, w, h);
    const Y = (val: number) => h - 22 - (val + 0.3) / 1.3 * (h - 36);
    ctx.strokeStyle = css('--line'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();
    ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(0, Y(0.25)); ctx.lineTo(w, Y(0.25)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = css('--muted'); ctx.font = '12px DM Sans, sans-serif'; ctx.fillText('threshold 1/4', 6, Y(0.25) - 4); ctx.fillText('position along the ring →', w - 150, h - 6);
    ctx.lineWidth = 2; ctx.strokeStyle = series()[0]; ctx.beginPath();
    for (let i = 0; i < N; i++) { const px = i / (N - 1) * w; if (i) ctx.lineTo(px, Y(u[i])); else ctx.moveTo(px, Y(u[i])); }
    ctx.stroke();
    ctx.strokeStyle = css('--ink'); ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < N; i++) { const px = i / (N - 1) * w; if (i) ctx.lineTo(px, Y(v[i])); else ctx.moveTo(px, Y(v[i])); }
    ctx.stroke(); ctx.setLineDash([]);
  };
  const state = { running: true };
  toggle(root.querySelector('[data-pm="play"]'), state);
  const advance = () => {
    for (let i = 0; i < 20; i++) step(0.025);
    const f = front();
    if (f !== null) {
      if (fronts.length && f < lastFront - L / 2) wraps++;
      lastFront = f;
      fronts.push([t, f + wraps * L]);
      fronts = fronts.filter(p => p[0] > t - 12);
    } else fronts = [];
    let text = `t = ${t.toFixed(0)}, ε = ${eps.toFixed(3)}. `;
    if (fronts.length > 20 && t > 15) {
      const n = fronts.length, mt = fronts.reduce((a, p) => a + p[0], 0) / n, mx = fronts.reduce((a, p) => a + p[1], 0) / n;
      const c = fronts.reduce((a, p) => a + (p[0] - mt) * (p[1] - mx), 0) / fronts.reduce((a, p) => a + (p[0] - mt) ** 2, 0);
      text += `Measured front speed ${c.toFixed(3)}.`;
    } else if (t > 15 && f === null) text += 'No pulse: the activity died out.';
    else text += 'Timing the front…';
    const inRange = eps >= info.range[0] && eps <= info.range[1];
    text += Math.abs(eps - 0.1) < 1e-9 ? ` Proved fast speed at ε = 1/10: ${info.fast.slice(0, 8)}.` : inRange ? ' A fast pulse is proved to exist at this ε.' : ' This ε is outside the proved range.';
    readout.textContent = text;
    draw();
  };
  slider.addEventListener('input', () => { eps = Number(slider.value); out.textContent = eps.toFixed(3); reset(); });
  root.querySelector('[data-pm="reset"]')?.addEventListener('click', reset);
  reset();
  loop(advance, () => state.running);
}

function rankWindow(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pm-rank]')!;
  const readout = root.querySelector('[data-pm="readout"]')!;
  const get = (k: string) => Number(root.querySelector<HTMLInputElement>(`[data-pm="${k}"]`)!.value);
  const M = 10000;
  const draw = () => {
    const a = get('head'), b = get('tail'), brk = get('brk');
    let lo = get('lo'), hi = get('hi');
    if (hi <= lo + 3) hi = lo + 4;
    ['head', 'tail', 'brk', 'lo', 'hi'].forEach(k => { root.querySelector(`[data-pm="${k}-out"]`)!.textContent = String(get(k)); });
    const lam = (n: number) => (n <= brk ? Math.pow(n, -a) : Math.pow(brk, -a) * Math.pow(n / brk, -b));
    let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
    for (let n = Math.max(1, Math.round(lo)); n <= Math.min(M, Math.round(hi)); n++) { const X = Math.log10(n), Y = Math.log10(lam(n)); sx += X; sy += Y; sxx += X * X; sxy += X * Y; m++; }
    const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx), icpt = (sy - slope * sx) / m;
    const ctx = fit(canvas); const { w, h } = size(canvas);
    ctx.clearRect(0, 0, w, h);
    const ymin = Math.log10(lam(M)) - 0.3, X = (n: number) => 46 + Math.log10(n) / Math.log10(M) * (w - 56), Y = (v: number) => 12 + (0 - v) / (0 - ymin) * (h - 44);
    ctx.fillStyle = css('--soft'); ctx.fillRect(X(lo), 12, X(hi) - X(lo), h - 44);
    ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--muted'); ctx.font = '12px DM Sans, sans-serif'; ctx.lineWidth = 1;
    for (const n of [1, 10, 100, 1000, 10000]) { ctx.beginPath(); ctx.moveTo(X(n), 12); ctx.lineTo(X(n), h - 32); ctx.stroke(); ctx.fillText(String(n), X(n) - 8, h - 16); }
    ctx.fillText('rank n (log scale)', w - 120, h - 2); ctx.fillText('variance (log)', 4, 10);
    ctx.strokeStyle = series()[0]; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const n = Math.pow(M, i / 400); if (i) ctx.lineTo(X(n), Y(Math.log10(lam(n)))); else ctx.moveTo(X(n), Y(Math.log10(lam(n)))); }
    ctx.stroke();
    ctx.strokeStyle = css('--ink'); ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(1), Y(icpt)); ctx.lineTo(X(M), Y(icpt + slope * Math.log10(M))); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = css('--muted'); ctx.beginPath(); ctx.moveTo(X(brk), 12); ctx.lineTo(X(brk), h - 32); ctx.stroke(); ctx.fillText('break', X(brk) + 4, 26);
    readout.textContent = `Fitted exponent over ranks ${Math.round(lo)} to ${Math.round(hi)}: ${(-slope).toFixed(3)}. The tail exponent, which decides smoothness, is ${b.toFixed(2)}. For a d = 8 stimulus set a smooth code needs a tail steeper than 1.25. ${hi <= brk ? 'This window never sees the tail.' : lo >= brk ? 'This window sits in the tail.' : 'This window straddles the break.'}`;
  };
  root.querySelectorAll('input').forEach(i => i.addEventListener('input', draw));
  new ResizeObserver(draw).observe(canvas);
  draw();
}

export function mountPaperModules(): void {
  const root = document.querySelector<HTMLElement>('.pm-module');
  if (!root) return;
  if (root.querySelector('[data-pm-vortex]')) vortex(root);
  if (root.querySelector('[data-pm-pendulum]')) pendulum(root);
  if (root.querySelector('[data-pm-hh]')) hhNeuron(root);
  if (root.querySelector('[data-pm-shoot]')) hhShoot(root);
  if (root.querySelector('[data-pm-field]')) neuralField(root);
  if (root.querySelector('[data-pm-rank]')) rankWindow(root);
}
