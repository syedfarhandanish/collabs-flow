"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minimize2, Pause, Play, RotateCcw, SkipForward, Music2, SkipBack } from "lucide-react";
import { MODE_LABEL, useTimer, useTimerClock } from "@/contexts/TimerContext";
import { useMusic } from "@/contexts/MusicContext";
import { useUI } from "@/contexts/UIContext";
import { useTasks } from "@/contexts/TasksContext";
import { formatClock } from "@/lib/dates";
import { QUOTES } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Equalizer } from "./MusicPlayer";

export function ZenMode() {
  const { zen, setZen } = useUI();
  const timer = useTimer();
  const clock = useTimerClock();
  const music = useMusic();
  const { activeTask } = useTasks();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [clockNow, setClockNow] = useState(() => new Date());

  useEffect(() => {
    if (!zen) return;
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    const id = window.setInterval(() => setClockNow(new Date()), 15_000);
    return () => {
      window.clearInterval(id);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
    };
  }, [zen]);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && zen) {
        // leaving browser fullscreen with Esc also exits zen
        setZen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [zen, setZen]);

  const resting = timer.mode !== "focus";

  return (
    <AnimatePresence>
      {zen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 isolate flex flex-col items-center justify-between bg-[#05050a]/90 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 animate-breathe rounded-full bg-c1/25 blur-[120px]" />
          <div className="flex w-full max-w-6xl items-center justify-between text-white/50">
            <span className="tabular text-sm">{clockNow.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
            <button onClick={() => setZen(false)} className="icon-btn" aria-label="Exit zen mode">
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.p
              key={timer.mode}
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              className={cn("text-sm font-semibold uppercase", resting ? "text-rest" : "text-c2")}
            >
              {MODE_LABEL[timer.mode]}
            </motion.p>
            <div
              className="tabular mt-2 text-[22vw] font-extralight leading-none tracking-tighter text-white sm:text-[15vw] lg:text-[13rem]"
              style={{ textShadow: "0 0 80px rgb(var(--c1) / 0.55)" }}
            >
              {formatClock(clock.remaining)}
            </div>
            <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10 sm:w-96">
              <div className="h-full rounded-full bg-accent-gradient transition-[width] duration-700" style={{ width: `${clock.progress * 100}%` }} />
            </div>
            {activeTask && (
              <p className="mt-6 text-lg text-white/70">
                <span className="text-white/40">Working on </span>
                {activeTask.title}
              </p>
            )}
            <div className="mt-10 flex items-center gap-4">
              <button className="icon-btn h-12 w-12" onClick={timer.reset} aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={timer.toggle}
                className="btn-glow grid h-20 w-20 place-items-center rounded-full bg-accent-gradient"
                aria-label={timer.running ? "Pause" : "Start"}
              >
                {timer.running ? <Pause className="h-8 w-8 fill-white text-white" /> : <Play className="h-8 w-8 translate-x-0.5 fill-white text-white" />}
              </motion.button>
              <button className="icon-btn h-12 w-12" onClick={timer.skip} aria-label="Skip">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex w-full max-w-6xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <p className="max-w-md text-center font-display text-lg italic text-white/45 sm:text-left">“{quote.text}”</p>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-1.5 pl-4 pr-1.5 backdrop-blur-xl">
              <Music2 className="h-4 w-4 text-c2" />
              <span className="max-w-[180px] truncate text-sm text-white/75">{music.nowTitle || music.station.title}</span>
              {music.isPlaying && <Equalizer active className="h-3" />}
              <button onClick={music.prev} className="rounded-full p-2 text-white/60 hover:text-white" aria-label="Previous">
                <SkipBack className="h-4 w-4" />
              </button>
              <button onClick={music.toggle} className="grid h-9 w-9 place-items-center rounded-full bg-white text-black" aria-label="Play or pause music">
                {music.isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 translate-x-px fill-black" />}
              </button>
              <button onClick={music.next} className="rounded-full p-2 text-white/60 hover:text-white" aria-label="Next">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
