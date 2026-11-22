"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { MODE_LABEL, useTimer, useTimerClock } from "@/contexts/TimerContext";
import { useMusic } from "@/contexts/MusicContext";
import { useUI } from "@/contexts/UIContext";
import { formatClock } from "@/lib/dates";
import { TimerRing } from "./TimerRing";
import { Equalizer } from "./MusicPlayer";

/** Floating pill that appears once the main timer scrolls out of view. */
export function MiniTimer() {
  const timer = useTimer();
  const clock = useTimerClock();
  const music = useMusic();
  const { zen } = useUI();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById("timer");
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setHidden(!e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const show = hidden && !zen && (timer.running || !timer.fresh);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-40 max-[380px]:right-3 flex items-center gap-3 rounded-full border border-white/10 bg-[#101019]/80 py-2 pl-2 pr-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <button
            onClick={() => document.getElementById("timer")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="flex items-center gap-3"
            aria-label="Scroll to timer"
          >
            <div className="relative h-11 w-11">
              <TimerRing progress={clock.progress} size={44} stroke={4} resting={timer.mode !== "focus"} />
            </div>
            <div className="text-left">
              <p className="tabular text-lg font-semibold leading-none text-white">{formatClock(clock.remaining)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/45">
                {MODE_LABEL[timer.mode]}
                {music.isPlaying && <Equalizer active className="h-2.5 opacity-70" />}
              </p>
            </div>
          </button>
          <button
            onClick={timer.toggle}
            className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-accent-gradient text-white"
            aria-label={timer.running ? "Pause" : "Start"}
          >
            {timer.running ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 translate-x-px fill-white" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
