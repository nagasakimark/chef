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

  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted) this.click();
    return this.muted;
  }
};
