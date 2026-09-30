import { SCENES, generate, normalizeSettings, routed, midiFile } from './music.js';
import { MIDIScheduler, MIDIConnection } from './midi.js';
import { modelPlan } from './model.js';
import { BrowserPreview } from './preview.js';

const $ = id => document.getElementById(id), names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const state = { seed: 1, song: null, settings: null, muted: new Set(), request: null, token: 0, busy: false, auditionToken: 0, logs: [], pendingEvolution: false };
const preview = new BrowserPreview();
const notify = (message, error = false) => { $('notice').textContent = message; $('notice').classList.toggle('error', error); };
const monitor = message => { state.logs.push(message); if (state.logs.length > 64) state.logs.shift(); $('monitor').textContent = state.logs.slice(-12).join('\n'); if (message.startsWith('Output disconnected')) { if (state.pendingEvolution) cancelRequest(); notify(message, true); } };
const scheduler = new MIDIScheduler({ onStatus: message => { notify(message, /failed|delay|disconnected/i.test(message)); updateTransport(); }, onLoop: count => {
  $('evolution-status').textContent = `Loop ${count + 1}${$('evolve').checked ? ' · Evolving' : ''}`;
  if ($('evolve').checked && count % 4 === 3 && !state.busy) compose({ evolution: true });
} });
const connection = new MIDIConnection(scheduler, { onMessage: monitor, onChange: info => {
  fillPorts($('output'), info.outputs, info.outputID, 'Choose a MIDI output'); fillPorts($('input'), info.inputs, info.inputID, 'No input monitor');
  $('output').disabled = false; $('input').disabled = false;
  $('connection-dot').classList.toggle('connected', !!info.outputID);
  $('connection-label').textContent = info.outputID ? 'MIDI output selected' : 'No output selected'; updateTransport();
} });
function fillPorts(select, ports, selected, label) {
  select.replaceChildren(new Option(label, ''), ...ports.map(p => new Option(p.name || p.id, p.id)));
  select.value = selected;
}
function settings() { return normalizeSettings({ bpm: $('bpm').value, bars: $('bars').value, root: $('root').value, mode: $('mode').value, density: $('density').value, seed: state.seed }); }
function currentSong() { return routed(state.song, $('layered').checked, state.muted); }
function updateTransport() {
  $('play').disabled = !scheduler.output || state.busy || !state.song?.tracks.some(t => !state.muted.has(t.kind));
  $('test-note').disabled = !scheduler.output || scheduler.running;
  $('play').textContent = scheduler.running ? '▶ Restart MPC' : '▶ Play to MPC';
}
function setBusy(value) {
  state.busy = value; $('generate').disabled = value; $('variation').disabled = value; $('cancel').hidden = !value; $('generate').textContent = value ? 'Designing…' : '✦ Generate landscape';
  for (const field of document.querySelectorAll('.scenes button, .settings input, .settings select')) field.disabled = value;
  updateTransport();
}
function cancelRequest() { state.token++; state.request?.abort(); state.request = null; state.pendingEvolution = false; setBusy(false); }
function stopAll(message = 'Stopped.') { cancelRequest(); state.auditionToken++; preview.stop(); const succeeded = scheduler.stop(); $('evolution-status').textContent = ''; updateTransport(); if (succeeded) notify(message); return succeeded; }
function draw() {
  const song = state.song;
  $('song-title').textContent = song.title; $('song-explanation').textContent = song.explanation;
  $('song-meta').textContent = `${song.bpm} BPM · ${song.bars} bars · ${names[state.settings.root]} ${state.settings.mode} · seed ${song.seed} · ${song.source}`;
  $('tracks').replaceChildren(...song.tracks.map(track => {
    const row = document.createElement('div'); row.className = `track${state.muted.has(track.kind) ? ' muted' : ''}`;
    const label = document.createElement('label'), checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = !state.muted.has(track.kind); checkbox.setAttribute('aria-label', `Enable ${track.name}`);
    checkbox.addEventListener('change', () => { stopAll(); if (checkbox.checked) state.muted.delete(track.kind); else state.muted.add(track.kind); draw(); });
    const text = document.createElement('span'), strong = document.createElement('strong'), small = document.createElement('small'); strong.textContent = track.name; small.textContent = `${track.notes.length} notes`; text.append(strong, small); label.append(checkbox, text);
    const roll = document.createElement('div'); roll.className = 'roll'; roll.setAttribute('aria-hidden', 'true');
    const low = Math.min(...track.notes.map(n => n.note)), high = Math.max(low + 1, ...track.notes.map(n => n.note));
    for (const note of track.notes) { const dot = document.createElement('span'); dot.className = 'note'; dot.style.left = `${note.start / (song.bars * 4) * 100}%`; dot.style.width = `${Math.max(0.4, note.duration / (song.bars * 4) * 100 - 0.12)}%`; dot.style.top = `${5 + (1 - (note.note - low) / (high - low)) * 33}px`; dot.style.opacity = `${note.velocity / 150}`; roll.append(dot); }
    row.append(label, roll); return row;
  })); updateTransport();
}
async function compose({ variation = false, evolution = false } = {}) {
  if (state.busy) return;
  if (!evolution) stopAll('Designing a landscape…');
  if (variation || evolution) state.seed++;
  const config = evolution ? { ...state.settings, seed: state.seed } : settings(), prompt = $('prompt').value;
  if (!prompt.trim()) { notify('Describe a musical direction first.', true); return; }
  const token = ++state.token, controller = new AbortController(); state.request = controller; state.pendingEvolution = evolution; setBusy(true);
  const timeout = setTimeout(() => controller.abort(new Error('The model request timed out.')), 120_000);
  try {
    let plan = null;
    if ($('engine').value === 'model') plan = await modelPlan({ endpoint: $('model-url').value, model: $('model-name').value, key: $('model-key').value, strict: $('strict-schema').checked, prompt, settings: config, signal: controller.signal });
    if (token !== state.token || controller.signal.aborted) return;
    const next = generate(config, prompt, plan);
    if (evolution) {
      if (!scheduler.running || !$('evolve').checked) return;
      scheduler.queue(routed(next, $('layered').checked, state.muted));
      $('evolution-status').textContent = 'Fresh variation queued for the next loop boundary.';
    }
    state.song = next; state.settings = config; draw();
    notify(evolution ? 'New variation queued. Playback continues through the next loop boundary.' : 'Landscape ready. Preview it here or play it through your MPC sounds.');
  } catch (error) {
    if (token === state.token) notify(controller.signal.aborted ? 'Generation canceled or timed out. Your current landscape is kept.' : error.message, !controller.signal.aborted);
  } finally { clearTimeout(timeout); if (token === state.token) { state.request = null; state.pendingEvolution = false; setBusy(false); } }
}
function scene(index) {
  stopAll(); const selected = SCENES[index]; $('prompt').value = selected.prompt; $('bpm').value = selected.bpm; $('root').value = selected.root; $('mode').value = selected.mode; $('bars').value = 8; $('density').value = 0.25; state.seed++;
  for (const [i, button] of [...$('scenes').children].entries()) button.classList.toggle('selected', i === index);
  compose();
}
for (const [i, sceneInfo] of SCENES.entries()) { const button = document.createElement('button'); button.textContent = sceneInfo.title; button.addEventListener('click', () => scene(i)); $('scenes').append(button); }
names.forEach((name, index) => $('root').append(new Option(name, String(index)))); $('root').value = '2'; $('prompt').value = SCENES[0].prompt; $('scenes').firstElementChild.classList.add('selected');
state.settings = settings(); state.song = generate(state.settings, $('prompt').value); draw();
$('generate').addEventListener('click', () => compose()); $('variation').addEventListener('click', () => compose({ variation: true })); $('cancel').addEventListener('click', () => { cancelRequest(); notify('Generation canceled. Your current landscape is kept.'); });
$('play').addEventListener('click', async () => {
  try { const token = state.token, outputID = scheduler.output?.id; state.auditionToken++; preview.stop(); await scheduler.output?.open(); if (token !== state.token || scheduler.output?.id !== outputID) return; scheduler.play(currentSong(), { loop: $('loop').checked, clock: $('clock').checked }); updateTransport(); }
  catch (error) { notify(error.message, true); }
});
$('stop').addEventListener('click', () => stopAll());
$('panic').addEventListener('click', () => { const stopped = stopAll(); const panicOK = scheduler.stop({ panic: true }); if (stopped && panicOK) notify(scheduler.output ? 'Note-offs, sustain off, All Notes Off and All Sound Off sent to the selected port.' : 'Playback stopped. No MIDI output is selected.'); });
$('preview').addEventListener('click', async () => { stopAll(); const token = state.token; try { await preview.play(currentSong(), () => notify('Browser preview finished.')); if (token === state.token) notify('Previewing one arrangement with simple browser synth sounds.'); } catch (error) { notify(error.message, true); } });
$('export').addEventListener('click', () => {
  try { const blob = new Blob([midiFile(currentSong())], { type: 'audio/midi' }), url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `${state.song.title.replace(/[^\w\s-]/g, '').slice(0, 70) || 'MPC landscape'}.mid`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('MIDI file exported. Import it in the MPC Browser to keep these notes as a sequence.'); }
  catch (error) { notify(error.message, true); }
});
$('connect-midi').addEventListener('click', async () => {
  try { await connection.connect(); const count = connection.access.outputs.size; notify(scheduler.output ? `${scheduler.output.name} selected. Load your sound on the MPC, then press Play.` : count ? 'MIDI permission granted. Select your MPC output below.' : 'MIDI permission granted; no output ports are exposed. Check the USB data cable, standalone mode and Windows MIDI setup.'); $('connect-midi').textContent = 'Refresh MIDI devices'; }
  catch (error) { notify(error.name === 'NotAllowedError' ? 'MIDI permission was denied. Allow MIDI in the browser site settings, then press Connect again.' : error.message, true); }
});
$('output').addEventListener('change', () => { stopAll(); connection.selectOutput($('output').value); updateTransport(); });
$('input').addEventListener('change', () => { connection.manualInput = true; connection.selectInput(connection.access?.inputs.get($('input').value) || null); });
for (const id of ['layered', 'loop', 'clock']) $(id).addEventListener('change', () => stopAll());
$('evolve').addEventListener('change', () => { if (!$('evolve').checked && state.pendingEvolution) cancelRequest(); $('evolution-status').textContent = $('evolve').checked && scheduler.running ? 'Variation design begins before every fourth loop boundary.' : ''; });
$('engine').addEventListener('change', () => { stopAll(); $('engine-info').textContent = $('engine').value === 'model' ? 'Your musical direction goes to the configured server. Its plan is rendered into notes by the local CPU engine.' : 'Voice-leading candidate search, sustained harmony and seeded phrase variation run on your CPU. This offline engine uses musical rules.'; if ($('engine').value === 'model') $('models').open = true; });
for (const id of ['bpm', 'root', 'mode', 'bars', 'density', 'prompt']) $(id).addEventListener('change', () => { if (scheduler.running || state.busy) stopAll('Settings changed. Generate a new landscape to apply them.'); });
$('model-url').addEventListener('input', () => { $('model-key').value = ''; if (state.busy) cancelRequest(); }); $('model-name').addEventListener('input', () => { if (state.busy) cancelRequest(); });
for (const button of document.querySelectorAll('[data-server]')) button.addEventListener('click', () => { stopAll(); $('model-key').value = ''; $('model-url').value = button.dataset.server === 'ollama' ? 'http://localhost:11434/v1' : 'http://localhost:1234/v1'; $('model-name').value = ''; });
function controlChannel() { const n = Number($('control-channel').value); if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error('Choose a channel from 1 to 16.'); return n - 1; }
$('test-note').addEventListener('click', () => {
  try { const ch = controlChannel(), outputID = scheduler.output?.id, token = ++state.auditionToken; scheduler.send([0x90 | ch, 60, 78]); scheduler.held.add(`${ch}:60`); setTimeout(() => { if (token === state.auditionToken && scheduler.output?.id === outputID) { try { scheduler.send([0x80 | ch, 60, 0]); scheduler.held.delete(`${ch}:60`); } catch (error) { notify(error.message, true); } } }, 400); }
  catch (error) { notify(error.message, true); }
});
$('control-value').addEventListener('input', () => {
  try { const ch = controlChannel(), cc = Number($('control-cc').value); if (!Number.isInteger(cc) || cc < 0 || cc > 119) throw new Error('Choose a CC from 0 to 119.'); scheduler.send([0xB0 | ch, cc, Number($('control-value').value)]); }
  catch (error) { notify(error.message, true); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && (scheduler.running || scheduler.held.size)) stopAll('MIDI playback stopped while this tab is hidden. Keep the studio visible during performance.'); });
window.addEventListener('pagehide', () => { stopAll(); connection.close(); });
// Read-only hooks for a controlled browser smoke test. No MIDI is requested.
window.MPCStudio = { get composition() { return state.song; }, get playing() { return scheduler.running; }, get port() { return scheduler.output?.name || null; }, version: '0.1.0' };
