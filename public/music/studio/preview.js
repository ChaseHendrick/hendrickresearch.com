export class BrowserPreview {
  constructor() { this.context = null; this.voices = []; this.timer = null; this.token = 0; }
  async play(song, onEnd = () => {}) {
    this.stop();
    const token = this.token;
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) throw new Error('This browser does not support Web Audio preview. MIDI export remains available.');
    this.context ||= new Audio();
    await this.context.resume();
    if (token !== this.token) return;
    const ctx = this.context, base = ctx.currentTime + 0.1;
    const master = ctx.createGain(); master.gain.value = 0.16; master.connect(ctx.destination); this.master = master;
    const delay = ctx.createDelay(2), feedback = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = 0.42; feedback.gain.value = 0.27; wet.gain.value = 0.2;
    master.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    this.effects = [master, delay, feedback, wet];
    for (const track of song.tracks) for (const note of track.notes) {
      if (track.kind === 'drums') continue;
      const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
      osc.type = track.kind === 'bass' ? 'sine' : 'triangle'; osc.frequency.value = 440 * 2 ** ((note.note - 69) / 12);
      filter.type = 'lowpass'; filter.frequency.value = track.kind === 'melody' ? 2800 : 1300;
      const start = base + note.start * 60 / song.bpm, duration = note.duration * 60 / song.bpm;
      const attack = Math.min(duration / 3, track.kind === 'chords' ? 0.7 : 0.12), peak = note.velocity / 127 * (track.kind === 'bass' ? 0.7 : 0.35);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(peak, start + attack); gain.gain.setValueAtTime(peak, start + duration); gain.gain.linearRampToValueAtTime(0, start + duration + 0.6);
      osc.connect(filter); filter.connect(gain); gain.connect(master); osc.start(start); osc.stop(start + duration + 0.65);
      this.voices.push({ osc, gain, filter });
    }
    this.timer = setTimeout(() => { this.stop(); onEnd(); }, (song.bars * 4 * 60 / song.bpm + 1) * 1000);
  }
  stop() {
    this.token++;
    clearTimeout(this.timer); this.timer = null;
    for (const voice of this.voices) { try { voice.gain.gain.cancelScheduledValues(this.context.currentTime); voice.gain.gain.setValueAtTime(0, this.context.currentTime); voice.osc.stop(); } catch { /* A voice that already ended needs only its nodes disconnected. */ } voice.osc.disconnect(); voice.gain.disconnect(); voice.filter.disconnect(); }
    this.voices = [];
    for (const node of this.effects || []) node.disconnect();
    this.effects = [];
  }
}
