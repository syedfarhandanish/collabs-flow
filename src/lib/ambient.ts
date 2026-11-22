"use client";

import { getAudioContext } from "./sounds";

export type AmbientId = "rain" | "waves" | "wind" | "fire" | "brown" | "white";

type NoiseColor = "white" | "pink" | "brown";

interface Channel {
  gain: GainNode;
  base: number;
  stoppers: Array<() => void>;
  stopTimer: number | null;
}

/** Builds a seamlessly looping noise buffer (tail is cross-faded into the head). */
function noiseBuffer(c: AudioContext, color: NoiseColor, seconds = 8) {
  const len = Math.floor(c.sampleRate * seconds);
  const fade = Math.floor(c.sampleRate * 0.5);
  const buffer = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const raw = new Float32Array(len + fade);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < raw.length; i++) {
      const w = Math.random() * 2 - 1;
      if (color === "white") raw[i] = w * 0.5;
      else if (color === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        raw[i] = last * 3.5;
      }
    }
    const out = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      if (i < fade) {
        const t = i / fade;
        out[i] = raw[i] * t + raw[len + i] * (1 - t);
      } else out[i] = raw[i];
    }
  }
  return buffer;
}

/** Sparse crackles and pops for the fireplace. */
function crackleBuffer(c: AudioContext, seconds = 9) {
  const len = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const out = buffer.getChannelData(ch);
    const pops = 70 + Math.floor(Math.random() * 30);
    for (let p = 0; p < pops; p++) {
      const start = Math.floor(Math.random() * (len - 4000));
      const size = 80 + Math.floor(Math.random() * (Math.random() < 0.2 ? 2500 : 600));
      const amp = 0.15 + Math.random() * (Math.random() < 0.15 ? 0.9 : 0.35);
      for (let i = 0; i < size; i++) {
        out[start + i] += (Math.random() * 2 - 1) * amp * Math.exp((-6 * i) / size);
      }
    }
  }
  return buffer;
}

class AmbientEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private channels = new Map<AmbientId, Channel>();
  private buffers = new Map<string, AudioBuffer>();

  constructor() {
    this.ctx = getAudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);
  }

  private buf(name: NoiseColor | "crackle") {
    let b = this.buffers.get(name);
    if (!b) {
      b = name === "crackle" ? crackleBuffer(this.ctx) : noiseBuffer(this.ctx, name);
      this.buffers.set(name, b);
    }
    return b;
  }

  private source(name: NoiseColor | "crackle") {
    const src = this.ctx.createBufferSource();
    src.buffer = this.buf(name);
    src.loop = true;
    src.start(0, Math.random() * 4);
    return src;
  }

  private lfo(freq: number, depth: number, target: AudioParam) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.value = freq;
    g.gain.value = depth;
    osc.connect(g).connect(target);
    osc.start();
    return osc;
  }

  private filter(type: BiquadFilterType, freq: number, q = 0.7) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  private build(id: AmbientId): Channel {
    const c = this.ctx;
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.connect(this.master);
    const stoppers: Array<() => void> = [];
    let base = 1;

    switch (id) {
      case "rain": {
        const src = this.source("pink");
        const hp = this.filter("highpass", 450);
        const lp = this.filter("lowpass", 9000);
        const hiss = this.source("white");
        const bp = this.filter("bandpass", 5200, 0.4);
        const hissGain = c.createGain();
        hissGain.gain.value = 0.25;
        src.connect(hp).connect(lp).connect(gain);
        hiss.connect(bp).connect(hissGain).connect(gain);
        stoppers.push(() => src.stop(), () => hiss.stop());
        base = 1.1;
        break;
      }
      case "waves": {
        const src = this.source("brown");
        const lp = this.filter("lowpass", 900);
        const swell = c.createGain();
        swell.gain.value = 0.55;
        const lfo = this.lfo(0.09, 0.45, swell.gain);
        src.connect(lp).connect(swell).connect(gain);
        stoppers.push(() => src.stop(), () => lfo.stop());
        base = 1.2;
        break;
      }
      case "wind": {
        const src = this.source("pink");
        const bp = this.filter("bandpass", 520, 0.9);
        const gust = c.createGain();
        gust.gain.value = 0.7;
        const l1 = this.lfo(0.05, 320, bp.frequency);
        const l2 = this.lfo(0.13, 0.3, gust.gain);
        src.connect(bp).connect(gust).connect(gain);
        stoppers.push(() => src.stop(), () => l1.stop(), () => l2.stop());
        base = 1.6;
        break;
      }
      case "fire": {
        const rumble = this.source("brown");
        const lp = this.filter("lowpass", 380);
        const rumbleGain = c.createGain();
        rumbleGain.gain.value = 0.7;
        const crackle = this.source("crackle");
        const hp = this.filter("highpass", 900);
        const crackleGain = c.createGain();
        crackleGain.gain.value = 0.55;
        rumble.connect(lp).connect(rumbleGain).connect(gain);
        crackle.connect(hp).connect(crackleGain).connect(gain);
        stoppers.push(() => rumble.stop(), () => crackle.stop());
        base = 1;
        break;
      }
      case "brown": {
        const src = this.source("brown");
        const lp = this.filter("lowpass", 1400);
        src.connect(lp).connect(gain);
        stoppers.push(() => src.stop());
        base = 0.9;
        break;
      }
      case "white": {
        const src = this.source("white");
        const lp = this.filter("lowpass", 12000);
        src.connect(lp).connect(gain);
        stoppers.push(() => src.stop());
        base = 0.35;
        break;
      }
    }
    return { gain, base, stoppers, stopTimer: null };
  }

  setLevel(id: AmbientId, level: number) {
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const now = this.ctx.currentTime;
    let ch = this.channels.get(id);
    if (level <= 0) {
      if (!ch) return;
      ch.gain.gain.cancelScheduledValues(now);
      ch.gain.gain.setTargetAtTime(0, now, 0.25);
      const channel = ch;
      if (channel.stopTimer) window.clearTimeout(channel.stopTimer);
      channel.stopTimer = window.setTimeout(() => {
        channel.stoppers.forEach((s) => {
          try {
            s();
          } catch {
            /* already stopped */
          }
        });
        channel.gain.disconnect();
        if (this.channels.get(id) === channel) this.channels.delete(id);
      }, 1600);
      return;
    }
    if (!ch) {
      ch = this.build(id);
      this.channels.set(id, ch);
    }
    if (ch.stopTimer) {
      window.clearTimeout(ch.stopTimer);
      ch.stopTimer = null;
    }
    ch.gain.gain.cancelScheduledValues(now);
    ch.gain.gain.setTargetAtTime(level * level * ch.base, now, 0.35);
  }

  setMaster(v: number) {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(v, now, 0.3);
  }
}

let engine: AmbientEngine | null = null;
export function getAmbientEngine() {
  if (!engine) engine = new AmbientEngine();
  return engine;
}
