"use client";

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export type ChimeKind = "bell" | "ding" | "soft" | "none";

export function playChime(kind: ChimeKind, volume: number) {
  if (kind === "none" || volume <= 0) return;
  if (kind === "bell" || kind === "ding") {
    const audio = new Audio(kind === "bell" ? "/bell2.wav" : "/bell1.wav");
    audio.volume = Math.min(1, Math.max(0, volume));
    void audio.play().catch(() => undefined);
    return;
  }
  // "soft" – a gentle synthesized major arpeggio
  try {
    const c = getAudioContext();
    const now = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22 * volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  } catch {
    /* audio unavailable */
  }
}
