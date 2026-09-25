const AudioFx = {
  ctx: null,
  muted: false,

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  tone(freq, time, duration, type, gain) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);
    amp.gain.setValueAtTime(0.0001, this.ctx.currentTime + time);
    amp.gain.exponentialRampToValueAtTime(gain || 0.08, this.ctx.currentTime + time + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + time + duration);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + time);
    osc.stop(this.ctx.currentTime + time + duration + 0.02);
  },

  click() {
    this.unlock();
    this.tone(640, 0, 0.05, "square", 0.05);
  },

  select() {
    this.unlock();
    this.tone(520, 0, 0.07, "triangle", 0.07);
    this.tone(780, 0.06, 0.09, "triangle", 0.07);
  },

  country() {
    this.unlock();
    this.tone(392, 0, 0.08, "square", 0.06);
    this.tone(523, 0.07, 0.1, "square", 0.06);
    this.tone(659, 0.14, 0.14, "square", 0.07);
  },

  whoosh() {
    this.unlock();
    this.tone(220, 0, 0.18, "sawtooth", 0.03);
  },

  cook() {
    this.unlock();
    this.tone(330, 0, 0.12, "triangle", 0.06);
    this.tone(392, 0.12, 0.12, "triangle", 0.06);
    this.tone(523, 0.24, 0.16, "triangle", 0.07);
  },

  celebrate() {
    this.unlock();
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, i * 0.09, 0.18, "square", 0.07));
  },

  // Short burst of filtered white noise — sizzles, splashes, cuts.
  noise(duration, freq, q, gain, time) {
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ctx.createGain();
    const t0 = ctx.currentTime + (time || 0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  },

  sizzle() {
    this.unlock();
    this.noise(0.55, 5200, 0.7, 0.09);
    this.noise(0.35, 2600, 1.2, 0.05, 0.12);
  },

  // Soft landing thud; pitch climbs a little with each stacked layer.
  thump(step) {
    this.unlock();
    const up = (step || 0) * 18;
    this.tone(150 + up, 0, 0.12, "sine", 0.18);
    this.tone(300 + up * 2, 0.02, 0.07, "triangle", 0.05);
  },

  plop() {
    this.unlock();
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const t0 = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.exponentialRampToValueAtTime(820, t0 + 0.09);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);
    this.noise(0.18, 1400, 0.8, 0.05, 0.03);
  },

  pour() {
    this.unlock();
    this.noise(0.9, 900, 0.6, 0.06);
    this.noise(0.7, 2200, 0.9, 0.03, 0.15);
  },

  ding() {
    this.unlock();
    this.tone(1318, 0, 0.9, "sine", 0.12);
    this.tone(1976, 0.01, 0.6, "sine", 0.05);
  },

  chop() {
    this.unlock();
    this.noise(0.09, 3200, 1.5, 0.12);
    this.tone(900, 0, 0.04, "square", 0.03);
  },

  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted) this.click();
    return this.muted;
  }
};
