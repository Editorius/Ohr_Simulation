(function (root) {
  "use strict";
  class TonePlayer {
    static createGraph(context, frequency) {
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(context.destination);
      return { oscillator, gain };
    }
    constructor() {
      this.context = null;
      this.oscillator = null;
      this.gain = null;
      this.on = false;
      this.volume = 10;
      this.frequency = 1000;
      this.generation = 0;
    }
    async start(frequency) {
      const token = ++this.generation;
      const Context = root.AudioContext || root.webkitAudioContext;
      if (!Context) throw Error("Dieser Browser unterstützt keine Tonausgabe.");
      if (!this.context) this.context = new Context();
      if (frequency >= this.context.sampleRate / 2)
        throw Error("Frequenz liegt über der Audiogrenze.");
      await this.context.resume();
      if (token !== this.generation) return;
      if (this.context.state !== "running")
        throw Error("Tonausgabe konnte nicht gestartet werden.");
      this.frequency = frequency;
      if (!this.oscillator) {
        const graph = TonePlayer.createGraph(this.context, frequency);
        this.oscillator = graph.oscillator;
        this.gain = graph.gain;
        this.oscillator.start();
      }
      this.on = true;
      this.setFrequency(frequency);
      this.setVolume(this.volume);
    }
    setVolume(value) {
      this.volume = Math.max(0, Math.min(100, value));
      if (this.gain) {
        const t = this.context.currentTime;
        this.gain.gain.cancelScheduledValues(t);
        this.gain.gain.setTargetAtTime(
          this.on ? 0.15 * (this.volume / 100) ** 2 : 0,
          t,
          0.015,
        );
      }
    }
    setFrequency(value) {
      this.frequency = value;
      if (this.context && value >= this.context.sampleRate / 2) {
        this.stop();
        return false;
      }
      if (this.oscillator)
        this.oscillator.frequency.setTargetAtTime(
          value,
          this.context.currentTime,
          0.01,
        );
      return true;
    }
    stop() {
      this.generation++;
      this.on = false;
      if (this.oscillator) {
        const t = this.context.currentTime;
        this.gain.gain.cancelScheduledValues(t);
        this.gain.gain.setTargetAtTime(0, t, 0.01);
        this.oscillator.stop(t + 0.1);
        this.oscillator = null;
        this.gain = null;
      }
    }
  }
  root.TonePlayer = TonePlayer;
})(globalThis);
