"use client";

import { motion } from "framer-motion";
import { AudioWaveform, CloudRain, Flame, Power, Waves, Wind, Radio } from "lucide-react";
import { AMBIENT_PRESETS, useAmbient } from "@/contexts/AmbientContext";
import type { AmbientId } from "@/lib/ambient";
import { cn } from "@/lib/utils";

const SOUNDS: Array<{ id: AmbientId; name: string; icon: typeof CloudRain; tint: string }> = [
  { id: "rain", name: "Rain", icon: CloudRain, tint: "from-sky-400/30" },
  { id: "waves", name: "Waves", icon: Waves, tint: "from-cyan-400/30" },
  { id: "wind", name: "Wind", icon: Wind, tint: "from-slate-300/25" },
  { id: "fire", name: "Fireplace", icon: Flame, tint: "from-orange-400/30" },
  { id: "brown", name: "Brown noise", icon: AudioWaveform, tint: "from-amber-700/40" },
  { id: "white", name: "White noise", icon: Radio, tint: "from-zinc-200/20" },
];

export function AmbientMixer() {
  const a = useAmbient();
  const anyOn = a.active.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.16 }}
      className="glass p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">
          <Waves className="h-4 w-4 text-c1" /> Soundscape
        </h2>
        <button
          onClick={a.stopAll}
          disabled={!anyOn}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
        >
          <Power className="h-3.5 w-3.5" /> All off
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {SOUNDS.map(({ id, name, icon: Icon, tint }) => {
          const on = a.active.includes(id);
          const level = a.levels[id];
          return (
            <div
              key={id}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-3 transition",
                on ? "border-white/20 bg-white/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
              )}
            >
              {on && <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", tint)} />}
              <button onClick={() => a.toggle(id)} className="relative flex w-full flex-col items-start gap-2 text-left" aria-pressed={on}>
                <Icon className={cn("h-5 w-5 transition", on ? "text-white" : "text-white/45")} />
                <span className={cn("text-xs font-medium", on ? "text-white" : "text-white/55")}>{name}</span>
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(level * 100)}
                onChange={(e) => a.setLevel(id, Number(e.target.value) / 100)}
                className={cn("range relative mt-2.5 w-full transition-opacity", on ? "opacity-100" : "opacity-30")}
                style={{ ["--val" as string]: `${Math.round(level * 100)}%` }}
                aria-label={`${name} volume`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {AMBIENT_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => a.applyPreset(p.mix)}
            className="chip transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <span>{p.emoji}</span> {p.name}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
