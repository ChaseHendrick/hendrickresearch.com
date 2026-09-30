export const MODES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], pentatonic: [0, 3, 5, 7, 10] };
export const SCENES = [
  { title: 'Coast at dusk', bpm: 64, root: 2, mode: 'minor', prompt: 'An ambient coast at dusk. Warm slowly evolving pads, deep gentle bass and sparse distant notes like lights across water. No drums. Leave space for reverbed guitar.' },
  { title: 'Rain through glass', bpm: 58, root: 5, mode: 'major', prompt: 'Ambient rain through glass. Soft glowing sustained chords and tiny bright melodic droplets. Calm, intimate and spacious. No drums.' },
  { title: 'Slow orbit', bpm: 68, root: 0, mode: 'dorian', prompt: 'A dark ambient slow orbit through a huge empty landscape. Long suspended chords, warm deep bass and a distant repeating motif. No drums.' },
  { title: 'Forest after rain', bpm: 60, root: 7, mode: 'major', prompt: 'An ambient forest after rain. Gentle bright open chords, sparse bell-like melody and peaceful organic harmonic movement. No drums.' },
];
const clamp = (n, lo, hi, fallback) => Number.isFinite(Number(n)) ? Math.max(lo, Math.min(hi, Number(n))) : fallback;
const mod = (n, d) => ((n % d) + d) % d;
export function normalizeSettings(s = {}) {
  return { bpm: clamp(s.bpm, 40, 240, 64), bars: Math.round(clamp(s.bars, 1, 32, 8)), root: mod(Math.round(clamp(s.root, 0, 11, 2)), 12), mode: MODES[s.mode] ? s.mode : 'minor', density: clamp(s.density, 0.08, 1, 0.25), seed: (Number(s.seed) || 1) >>> 0 };
}
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const PLAN_SCHEMA = { type: 'object', additionalProperties: false, properties: {
  title: { type: 'string' }, explanation: { type: 'string' }, progression: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'integer', minimum: 0, maximum: 6 } },
  motif: { type: 'array', minItems: 8, maxItems: 8, items: { type: 'integer', minimum: 0, maximum: 6 } },
  bassEnergy: { type: 'number', minimum: 0, maximum: 1 }, chordEnergy: { type: 'number', minimum: 0, maximum: 1 }, melodyEnergy: { type: 'number', minimum: 0, maximum: 1 }, drumEnergy: { type: 'number', minimum: 0, maximum: 1 },
  bright: { type: 'boolean' }, includeBass: { type: 'boolean' }, includeChords: { type: 'boolean' }, includeMelody: { type: 'boolean' }, includeDrums: { type: 'boolean' },
}, required: ['title', 'explanation', 'progression', 'motif', 'bassEnergy', 'chordEnergy', 'melodyEnergy', 'drumEnergy', 'bright', 'includeBass', 'includeChords', 'includeMelody', 'includeDrums'] };
export function validatePlan(p) {
  if (!p || typeof p !== 'object' || typeof p.title !== 'string' || !p.title.trim() || p.title.length > 200 || typeof p.explanation !== 'string' || p.explanation.length > 2000) throw new Error('The model returned an invalid arrangement plan. Your current music is unchanged.');
  for (const [key, length] of [['progression', 4], ['motif', 8]]) if (!Array.isArray(p[key]) || p[key].length !== length || !p[key].every(n => Number.isInteger(n) && n >= 0 && n <= 6)) throw new Error(`Invalid model ${key}. Use a model with JSON output support.`);
  for (const key of ['bassEnergy', 'chordEnergy', 'melodyEnergy', 'drumEnergy']) if (!Number.isFinite(p[key]) || p[key] < 0 || p[key] > 1) throw new Error(`Invalid model ${key}.`);
  for (const key of ['bright', 'includeBass', 'includeChords', 'includeMelody', 'includeDrums']) if (typeof p[key] !== 'boolean') throw new Error(`Invalid model ${key}.`);
  if (!p.includeBass && !p.includeChords && !p.includeMelody && !p.includeDrums) throw new Error('The model disabled every musical part. Try another direction.');
  return p;
}
function localPlan(prompt, s) {
  const text = prompt.toLowerCase();
  const bright = /bright|glow|sun|forest|droplet/.test(text);
  return { title: SCENES.find(scene => scene.prompt === prompt)?.title || 'Open landscape', explanation: 'Sustained harmony, smooth voice movement and sparse phrases, rendered locally from a reproducible seed. The offline engine uses musical rules. It is not an AI model.',
    progression: bright ? [0, 3, 5, 4] : [0, 5, 2, 3], motif: bright ? [0, 2, 4, 6, 4, 2, 1, 0] : [0, 2, 4, 3, 2, 0, 1, 0],
    bassEnergy: s.density, chordEnergy: 1, melodyEnergy: /sparse|space|distant|minimal/.test(text) ? s.density * 0.6 : s.density,
    drumEnergy: s.density * 0.5, bright, includeDrums: /\bdrums?\b|percussion/.test(text) && !/no drums|without drums|drumless|no percussion/.test(text),
    includeBass: !/no bass|without bass/.test(text), includeChords: !/no chords|without chords|no pads/.test(text), includeMelody: !/no melody|without melody/.test(text) };
}
function chooseVoicing(pitches, previous, random) {
  const candidates = [];
  function search(index, notes) {
    if (index === pitches.length) {
      const ordered = [...notes].sort((a, b) => a - b);
      if (new Set(ordered).size !== ordered.length || ordered.at(-1) - ordered[0] > 25) return;
      const center = ordered.reduce((sum, n) => sum + n, 0) / ordered.length;
      let score = Math.abs(center - 61) * 0.6;
      if (previous) for (let i = 0; i < ordered.length; i++) score += Math.abs(ordered[i] - previous[i]) * (i === 0 ? 1.15 : 1);
      for (let i = 1; i < ordered.length; i++) if (ordered[i] - ordered[i - 1] <= 1) score += 9;
      score += random() * 1.6;
      candidates.push({ notes: ordered, score }); return;
    }
    for (let octave = 3; octave <= 6; octave++) {
      const note = pitches[index] + octave * 12;
      if (note >= 48 && note <= 79) search(index + 1, [...notes, note]);
    }
  }
  search(0, []);
  candidates.sort((a, b) => a.score - b.score);
  return candidates[0]?.notes || pitches.map((n, i) => n + (i < 2 ? 48 : 60)).sort((a, b) => a - b);
}
export function generate(settings = {}, prompt = SCENES[0].prompt, suppliedPlan = null) {
  const s = normalizeSettings(settings), random = seededRandom(s.seed), plan = suppliedPlan ? { ...validatePlan(suppliedPlan) } : localPlan(prompt, s);
  if (/no drums|without drums|drumless|no percussion/i.test(prompt)) plan.includeDrums = false;
  const scale = MODES[s.mode], end = s.bars * 4;
  const pitch = (degree, base) => base + s.root + scale[mod(degree, scale.length)] + Math.floor(degree / scale.length) * 12;
  const parts = { chords: [], bass: [], melody: [], drums: [] };
  const add = (kind, note, velocity, start, duration) => { if (start < end) parts[kind].push({ note: Math.round(clamp(note, 0, 127, 60)), velocity: Math.round(clamp(velocity, 1, 127, 64)), start: Math.max(0, start), duration: Math.min(duration, end - start) }); };
  let previous = null, motifIndex = 0;
  for (let start = 0, phrase = 0; start < end; start += 8, phrase++) {
    const degree = mod(plan.progression[phrase % 4], scale.length), length = Math.min(8, end - start);
    const classes = [0, 2, 4, 6].map(offset => mod(pitch(degree + offset, 0), 12));
    const voicing = chooseVoicing(classes, previous, random); previous = voicing;
    if (plan.includeChords) voicing.forEach((note, i) => add('chords', note, 46 + plan.chordEnergy * 22 + random() * 9, start + i * 0.045, length - i * 0.045 - 0.08));
    if (plan.includeBass) add('bass', pitch(degree, 36), 58 + random() * 10, start + 0.025, length - 0.11);
    if (plan.includeBass && plan.bassEnergy > 0.55 && phrase % 2) add('bass', pitch(degree + 4, 36), 46, start + length - 1, 0.85);
    if (plan.includeMelody) for (let step = 0; step < 8 && start + step < end; step++) {
      const chance = step === 1 && phrase % 2 === 0 ? 0.9 : plan.melodyEnergy * 0.75;
      if (random() < chance) {
        const motifDegree = plan.motif[mod(motifIndex++ + phrase, 8)];
        add('melody', pitch(degree + motifDegree, plan.bright ? 72 : 60), 48 + random() * 20, start + step + 0.12 + random() * 0.08, 1.1 + random() * 1.8);
      }
    }
    if (plan.includeDrums) for (let beat = 0; beat < length; beat++) {
      if (beat % 4 === 0) add('drums', 36, 62, start + beat, 0.12);
      if (beat % 4 === 2 && random() < plan.drumEnergy) add('drums', 38, 48, start + beat, 0.12);
      if (random() < plan.drumEnergy) add('drums', 42, 38 + random() * 10, start + beat + 0.5, 0.1);
    }
  }
  const tracks = [['chords', 'Warm pads', 1], ['bass', 'Deep bass', 1], ['melody', 'Distant notes', 1], ['drums', 'Soft percussion', 10]].map(([kind, name, channel]) => ({ kind, name, channel, notes: parts[kind].sort((a, b) => a.start - b.start || a.note - b.note) })).filter(track => track.notes.length);
  if (!tracks.length) throw new Error('No notes were generated. Enable at least one part in your direction.');
  return { title: plan.title.replace(/[\u2014]/g, ',').slice(0, 120), explanation: plan.explanation.replace(/[\u2014]/g, ','), bpm: s.bpm, bars: s.bars, seed: s.seed, tracks, source: suppliedPlan ? 'Model arrangement + local MIDI renderer' : 'Offline CPU composer' };
}
export function routed(song, layered = true, muted = new Set()) {
  return { ...song, tracks: song.tracks.filter(t => !muted.has(t.kind)).map(t => ({ ...t, channel: t.kind === 'drums' ? 10 : layered ? 1 : ({ bass: 2, chords: 3, melody: 4 }[t.kind] || 1) })) };
}
export function mergeEvents(song) {
  if (!song || !Number.isFinite(song.bpm) || song.bpm < 40 || song.bpm > 240 || !Number.isInteger(song.bars) || song.bars < 1 || song.bars > 32) throw new Error('Invalid composition tempo or length.');
  const end = song.bars * 4, groups = new Map();
  for (const track of song.tracks) {
    if (!Number.isInteger(track.channel) || track.channel < 1 || track.channel > 16) throw new Error('MIDI channels must be 1 to 16.');
    for (const n of track.notes) {
      if (![n.note, n.velocity].every(Number.isInteger) || n.note < 0 || n.note > 127 || n.velocity < 1 || n.velocity > 127 || !Number.isFinite(n.start) || !Number.isFinite(n.duration) || n.start < 0 || n.start >= end || n.duration <= 0) throw new Error('The composition contains an invalid MIDI note.');
      const key = `${track.channel}:${n.note}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ ...n, channel: track.channel, end: Math.min(end, n.start + n.duration) });
    }
  }
  const events = [];
  for (const notes of groups.values()) {
    const merged = [];
    for (const n of notes.sort((a, b) => a.start - b.start)) {
      const last = merged.at(-1);
      if (last && n.start < last.end - 1e-6) { last.end = Math.max(last.end, n.end); last.velocity = Math.max(last.velocity, n.velocity); }
      else merged.push({ ...n });
    }
    for (const n of merged) {
      events.push({ beat: n.start, bytes: [0x90 | n.channel - 1, n.note, n.velocity], on: true });
      events.push({ beat: n.end, bytes: [0x80 | n.channel - 1, n.note, 0], on: false });
    }
  }
  return events.sort((a, b) => a.beat - b.beat || Number(a.on) - Number(b.on));
}
const textBytes = text => [...new TextEncoder().encode(text)];
function variable(value) { let bytes = [value & 127]; while ((value >>>= 7) > 0) bytes.unshift((value & 127) | 128); return bytes; }
const word = n => [n >>> 8 & 255, n & 255];
const long = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255];
export function midiFile(song) {
  const events = mergeEvents(song), ppq = 480, tempo = Math.round(60_000_000 / song.bpm), name = textBytes(song.title.slice(0, 100));
  const track = [0, 0xFF, 0x03, ...variable(name.length), ...name, 0, 0xFF, 0x51, 3, tempo >>> 16 & 255, tempo >>> 8 & 255, tempo & 255, 0, 0xFF, 0x58, 4, 4, 2, 24, 8];
  let lastTick = 0;
  for (const event of events) { const tick = Math.round(event.beat * ppq); track.push(...variable(tick - lastTick), ...event.bytes); lastTick = tick; }
  track.push(...variable(song.bars * 4 * ppq - lastTick), 0xFF, 0x2F, 0);
  return new Uint8Array([...textBytes('MThd'), ...long(6), ...word(0), ...word(1), ...word(ppq), ...textBytes('MTrk'), ...long(track.length), ...track]);
}
