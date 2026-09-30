import { mergeEvents } from './music.js';

export function preferredMPC(ports) {
  const candidates = ports.filter(p => /mpc/i.test(p.name || ''));
  if (candidates.length === 1) return candidates[0];
  const stems = new Set(candidates.map(p => p.name.toLowerCase().replace(/\s/g, '').replace(/(?:midi|port)\d+$/, '')));
  if (stems.size !== 1) return null;
  const primary = candidates.filter(p => /(?:midi|port)1$/i.test(p.name.replace(/\s/g, '')));
  return primary.length === 1 ? primary[0] : null;
}
export class MIDIScheduler {
  constructor({ now = () => performance.now(), setTimer = fn => setInterval(fn, 12), clearTimer = id => clearInterval(id), onStatus = () => {}, onLoop = () => {} } = {}) {
    Object.assign(this, { now, setTimer, clearTimer, onStatus, onLoop }); this.output = null; this.running = false; this.held = new Set(); this.timer = null; this.pending = null;
  }
  select(output) { if (this.output?.id !== output?.id) this.stop(); this.output = output; }
  send(bytes, time) { if (!this.output || this.output.state === 'disconnected') throw new Error('Select a connected MIDI output first.'); this.output.send(bytes, time); }
  play(song, { loop = true, clock = false } = {}) {
    const events = mergeEvents(song);
    if (!events.length) throw new Error('Enable at least one part before playback.');
    if (!this.output || this.output.state === 'disconnected') throw new Error('Connect USB MIDI and select your MPC output first.');
    this.stop(); this.song = song; this.events = events; this.length = song.bars * 4 * 60_000 / song.bpm; this.base = this.now() + 55; this.cycleStart = 0; this.index = 0; this.loopCount = 0; this.boundaries = []; this.clockIndex = 0; this.clock = clock; this.loop = loop; this.running = true;
    try { if (clock) this.send([0xFA], this.base); this.timer = this.setTimer(() => this.pump()); this.pump(); if (this.running) this.onStatus(`Playing ${song.title}`); }
    catch (error) { this.stop(); throw error; }
  }
  queue(song) { if (!this.running || !this.loop) throw new Error('Start looping playback before queuing a variation.'); if (song.bpm !== this.song.bpm) throw new Error('Variations must keep the current tempo.'); this.pending = { song, events: mergeEvents(song), length: song.bars * 4 * 60_000 / song.bpm }; if (!this.pending.events.length) { this.pending = null; throw new Error('The variation has no enabled notes.'); } }
  pump() {
    if (!this.running) return;
    const elapsed = this.now() - this.base, horizon = elapsed + 55;
    try {
      while (this.boundaries.length && this.boundaries[0] <= elapsed) { this.boundaries.shift(); this.onLoop(++this.loopCount); }
      while (true) {
        if (this.index === this.events.length) {
          const boundary = this.cycleStart + this.length;
          if (!this.loop || boundary > horizon) break;
          this.cycleStart = boundary; this.boundaries.push(boundary); this.index = 0;
          if (this.pending) { Object.assign(this, this.pending); this.pending = null; this.onStatus(`Playing ${this.song.title}`); }
        }
        const event = this.events[this.index], time = this.cycleStart + event.beat * 60_000 / this.song.bpm;
        if (time > horizon) break;
        if (time < elapsed - 55) throw new Error('Playback stopped after a scheduling delay. Keep this tab visible and press Play again.');
        this.send(event.bytes, this.base + time);
        if (event.on) this.held.add(`${event.bytes[0] & 15}:${event.bytes[1]}`);
        this.index++;
      }
      if (!this.loop && elapsed >= this.length) { this.stop(); this.onStatus('Finished.'); return; }
      if (this.clock) {
        const pulse = 60_000 / this.song.bpm / 24, end = !this.loop ? this.length - 0.001 : Infinity;
        while (this.clockIndex * pulse <= Math.min(horizon, end)) {
          const time = this.clockIndex * pulse;
          if (time < elapsed - 55) throw new Error('Clock stopped after a scheduling delay. Keep this tab visible.');
          this.send([0xF8], this.base + time); this.clockIndex++;
        }
      }
    } catch (error) { this.stop(); this.onStatus(error.message); }
  }
  stop({ panic = false } = {}) {
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null; const active = this.running || this.held.size || panic, wasClock = this.clock;
    this.running = false; this.pending = null; this.clock = false; this.boundaries = []; let succeeded = true;
    if (this.output && active && this.output.state !== 'disconnected') {
      try {
        this.output.clear();
        for (const key of this.held) { const [ch, note] = key.split(':').map(Number); this.output.send([0x80 | ch, note, 0]); }
        for (let ch = 0; ch < 16; ch++) for (const cc of [64, 123, 120]) this.output.send([0xB0 | ch, cc, 0]);
        if (wasClock) this.output.send([0xFC]);
      } catch (error) { succeeded = false; this.onStatus(`MIDI cleanup failed: ${error.message}. Use Stop on the MPC.`); }
    }
    this.held.clear();
    return succeeded;
  }
}
export class MIDIConnection {
  constructor(scheduler, { onChange = () => {}, onMessage = () => {} } = {}) { this.scheduler = scheduler; this.onChange = onChange; this.onMessage = onMessage; this.access = null; this.input = null; this.manualOutput = false; this.manualInput = false; }
  async connect() {
    if (!globalThis.isSecureContext) throw new Error('Web MIDI needs HTTPS or localhost. Open the hosted studio in Chrome or Edge.');
    if (!navigator.requestMIDIAccess) throw new Error('This browser does not expose Web MIDI. Use current Chrome or Edge on Windows.');
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    this.access.onstatechange = () => this.refresh(); this.refresh();
  }
  refresh() {
    if (!this.access) return;
    const outputs = [...this.access.outputs.values()].filter(p => p.state === 'connected'), inputs = [...this.access.inputs.values()].filter(p => p.state === 'connected');
    if (this.scheduler.output?.state === 'disconnected' || (this.scheduler.output && !outputs.some(p => p.id === this.scheduler.output.id))) { this.scheduler.stop(); this.scheduler.output = null; this.onMessage('Output disconnected. Playback stopped. Use Stop on the MPC if a note remains held.'); }
    if (!this.scheduler.output && !this.manualOutput) this.scheduler.select(preferredMPC(outputs));
    if (this.input && !inputs.some(p => p.id === this.input.id)) this.selectInput(null);
    if (!this.input && !this.manualInput) this.selectInput(preferredMPC(inputs));
    this.onChange({ outputs, inputs, outputID: this.scheduler.output?.id || '', inputID: this.input?.id || '' });
  }
  selectOutput(id) { this.manualOutput = true; this.scheduler.select(this.access?.outputs.get(id) || null); this.refresh(); }
  selectInput(port) {
    if (this.input) this.input.onmidimessage = null;
    this.input = port;
    if (port) port.onmidimessage = e => {
      const [status, a, b] = e.data, command = status & 0xF0, channel = (status & 15) + 1;
      if (command === 0x90 || command === 0x80) this.onMessage(`IN ch ${channel} ${command === 0x80 || b === 0 ? 'Note Off' : 'Note On'} ${a}${command === 0x90 ? ` velocity ${b}` : ''}`);
      else if (command === 0xB0) this.onMessage(`IN ch ${channel} CC ${a} = ${b}`);
    };
  }
  close() { this.scheduler.stop(); if (this.input) this.input.onmidimessage = null; if (this.access) this.access.onstatechange = null; }
}
