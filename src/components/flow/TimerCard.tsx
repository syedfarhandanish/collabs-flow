"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, ChevronDown, Coffee, Maximize2, Pause, Play, Plus, RotateCcw, SkipForward, Sofa, Target } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MODE_LABEL, useTimer, useTimerClock, type Mode } from "@/contexts/TimerContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTasks } from "@/contexts/TasksContext";
import { useUI } from "@/contexts/UIContext";
import { formatClock } from "@/lib/dates";
import { tagColor } from "@/lib/content";
import { cn } from "@/lib/utils";
import { TimerRing } from "./TimerRing";

const MODES: Array<{ id: Mode; icon: typeof Brain }> = [
  { id: "focus", icon: Brain },
  { id: "short", icon: Coffee },
  { id: "long", icon: Sofa },
];

export function useRingSize() {
  const [size, setSize] = useState(340);
  useEffect(() => {
    const calc = () => setSize(window.innerWidth < 400 ? 260 : window.innerWidth < 640 ? 300 : 340);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return size;
}

export function TaskPicker({ compact }: { compact?: boolean }) {
  const { tasks, activeTask, setActive } = useTasks();
  const [open, setOpen] = useState(false);
  const open_ = tasks.filter((t) => t.status !== "done");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm transition hover:border-white/20 hover:bg-white/[0.08]",
            compact && "px-3 py-1.5 text-xs"
          )}
        >
          <Target className="h-4 w-4 shrink-0 text-c2" />
          {activeTask ? (
            <>
              <span className="text-white/50">Focusing on</span>
              <span className="truncate font-medium text-white">{activeTask.title}</span>
              <span className="tabular shrink-0 text-white/40">
                {activeTask.done}/{activeTask.est}
              </span>
            </>
          ) : (
            <span className="text-white/60">What are you working on?</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/40 transition group-hover:text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl border-white/10 bg-[#12121c]/95 p-2 backdrop-blur-xl">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-widest text-white/45">Pick a task</p>
        {open_.length === 0 && (
          <p className="px-2 pb-3 text-sm text-white/50">No open tasks yet — add one on the task board below.</p>
        )}
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {open_.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActive(t.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/[0.06]",
                activeTask?.id === t.id && "bg-white/[0.08]"
              )}
            >
              <span className="flex-1 truncate text-white/90">{t.title}</span>
              {t.subject && <span className={cn("rounded-full px-2 py-0.5 text-[10px] ring-1", tagColor(t.subject))}>{t.subject}</span>}
            </button>
          ))}
        </div>
        {activeTask && (
          <button
            onClick={() => {
              setActive(null);
              setOpen(false);
            }}
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs text-white/50 hover:bg-white/[0.05] hover:text-white/80"
          >
            Clear focus task
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function TimerCard() {
  const timer = useTimer();
  const clock = useTimerClock();
  const { settings } = useSettings();
  const ui = useUI();
  const size = useRingSize();
  const resting = timer.mode !== "focus";
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      id="timer"
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass relative flex h-full flex-col items-center overflow-hidden px-4 pb-8 pt-5 sm:px-8"
    >
      {/* mode glow */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] transition-colors duration-1000",
          resting ? "bg-rest/25" : "bg-c1/25",
          timer.running && "animate-breathe"
        )}
      />

      <div className="relative flex w-full items-center justify-between">
        <div className="relative flex rounded-full border border-white/10 bg-black/20 p-1">
          {MODES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => timer.switchMode(id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
                timer.mode === id ? "text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {timer.mode === id && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.12] ring-1 ring-white/15"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{MODE_LABEL[id].replace(" break", "")}</span>
              <span className="relative hidden text-white/35 sm:inline">
                {id === "focus" ? settings.focusMin : id === "short" ? settings.shortMin : settings.longMin}
              </span>
            </button>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="icon-btn h-9 w-9" onClick={() => ui.setZen(true)} aria-label="Zen mode">
              <Maximize2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zen mode (Z)</TooltipContent>
        </Tooltip>
      </div>

      <div className="relative mt-6" style={{ width: size, height: size }}>
        <TimerRing progress={clock.progress} size={size} stroke={size > 300 ? 10 : 8} resting={resting} ticks glow={timer.running} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={timer.mode}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className={cn(
                "mb-1 text-xs font-semibold uppercase tracking-[0.35em]",
                resting ? "text-rest" : "text-c2"
              )}
            >
              {resting ? "Recharge" : timer.running ? "Deep focus" : "Focus"}
            </motion.div>
          </AnimatePresence>
          <div
            className={cn(
              "tabular font-light tracking-tight text-white",
              size > 300 ? "text-7xl" : "text-6xl"
            )}
            style={{ textShadow: "0 0 40px rgba(255,255,255,0.25)" }}
          >
            {formatClock(clock.remaining)}
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: settings.longEvery }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i < timer.cycle % settings.longEvery || (timer.mode === "long" && timer.cycle > 0)
                    ? "w-5 bg-accent-gradient"
                    : "w-1.5 bg-white/20"
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">
            {timer.mode === "long" ? "Long break earned" : `Round ${(timer.cycle % settings.longEvery) + 1} of ${settings.longEvery}`}
          </p>
        </div>
      </div>

      <div className="relative mt-6 w-full max-w-md px-2 text-center">
        <TaskPicker />
      </div>

      <div className="relative mt-7 flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="icon-btn h-12 w-12" onClick={timer.reset} aria-label="Reset">
              <RotateCcw className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Reset (R)</TooltipContent>
        </Tooltip>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.04 }}
          onClick={timer.toggle}
          className="btn-glow relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-gradient text-white sm:h-20 sm:w-auto sm:min-w-[180px] sm:gap-2 sm:px-8"
          aria-label={timer.running ? "Pause" : "Start"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={timer.running ? "pause" : "play"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {timer.running ? <Pause className="h-7 w-7 fill-white" /> : <Play className="h-7 w-7 translate-x-0.5 fill-white" />}
              <span className="hidden text-lg font-semibold tracking-wide sm:inline">
                {timer.running ? "Pause" : timer.fresh ? "Start" : "Resume"}
              </span>
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="icon-btn h-12 w-12" onClick={timer.skip} aria-label="Skip">
              <SkipForward className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Skip to next (S)</TooltipContent>
        </Tooltip>
      </div>

      <div className="relative mt-5 flex items-center gap-2 text-xs text-white/45">
        <button
          onClick={() => timer.addMinutes(1)}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          <Plus className="h-3 w-3" /> 1 min
        </button>
        <span className="h-3 w-px bg-white/15" />
        <button
          onClick={() => timer.addMinutes(5)}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          <Plus className="h-3 w-3" /> 5 min
        </button>
        <span className="h-3 w-px bg-white/15" />
        <span className="px-2.5">
          press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">space</kbd> to {timer.running ? "pause" : "start"}
        </span>
      </div>
    </motion.section>
  );
}
