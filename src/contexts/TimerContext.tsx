"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { readStorage, writeStorage } from "@/lib/storage";
import { playChime } from "@/lib/sounds";
import { formatClock } from "@/lib/dates";
import { useSettings, type Settings } from "./SettingsContext";
import { useStats } from "./StatsContext";
import { useTasks } from "./TasksContext";

export type Mode = "focus" | "short" | "long";

export const MODE_LABEL: Record<Mode, string> = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

interface TimerState {
  mode: Mode;
  running: boolean;
  endAt: number | null;
  remainingMs: number;
  totalMs: number;
  cycle: number;
  fresh: boolean;
}

const durationMs = (s: Settings, m: Mode) =>
  (m === "focus" ? s.focusMin : m === "short" ? s.shortMin : s.longMin) * 60_000;

const remainingOf = (st: TimerState) =>
  st.running && st.endAt ? Math.max(0, st.endAt - Date.now()) : st.remainingMs;

export function celebrate(kind: "session" | "task") {
  window.dispatchEvent(new CustomEvent("cf:celebrate", { detail: kind }));
}

interface ControlCtx {
  mode: Mode;
  running: boolean;
  cycle: number;
  fresh: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (m: Mode) => void;
  addMinutes: (n: number) => void;
}

interface ClockCtx {
  remaining: number; // seconds
  total: number; // seconds
  progress: number; // 0..1
}

const ControlContext = createContext<ControlCtx | null>(null);
const ClockContext = createContext<ClockCtx | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { recordFocus } = useStats();
  const { creditActiveTask, activeTask } = useTasks();

  const [state, setState] = useState<TimerState>(() => {
    const saved = readStorage<TimerState | null>("cf:timer", null);
    if (saved?.mode && typeof saved.totalMs === "number") return saved;
    const total = durationMs(settings, "focus");
    return { mode: "focus", running: false, endAt: null, remainingMs: total, totalMs: total, cycle: 0, fresh: true };
  });
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onFocusDone = useRef<() => void>(() => undefined);
  onFocusDone.current = () => {
    const min = settingsRef.current.focusMin;
    recordFocus(min);
    creditActiveTask();
    celebrate("session");
    toast.success(`Session complete · +${min} XP`, {
      description: activeTask ? `Nice work on “${activeTask.title}”. Time for a break.` : "Great focus! Time for a break.",
    });
  };

  const commit = useCallback((next: TimerState) => {
    stateRef.current = next;
    setState(next);
    writeStorage("cf:timer", next);
  }, []);

  const [remainingSec, setRemainingSec] = useState(() => Math.ceil(remainingOf(state) / 1000));

  const complete = useCallback(() => {
    const cur = stateRef.current;
    const s = settingsRef.current;
    let nextMode: Mode;
    let cycle = cur.cycle;
    let auto: boolean;
    if (cur.mode === "focus") {
      cycle = cur.cycle + 1;
      nextMode = cycle % s.longEvery === 0 ? "long" : "short";
      auto = s.autoStartBreaks;
    } else {
      nextMode = "focus";
      if (cur.mode === "long") cycle = 0;
      auto = s.autoStartFocus;
    }
    const total = durationMs(s, nextMode);
    commit({
      mode: nextMode,
      cycle,
      running: auto,
      endAt: auto ? Date.now() + total : null,
      remainingMs: total,
      totalMs: total,
      fresh: !auto,
    });
    setRemainingSec(Math.ceil(total / 1000));

    playChime(s.chime, s.chimeVolume);
    if (cur.mode === "focus") onFocusDone.current();
    else toast("Break's over", { description: "Ready for another round of focus?" });

    if (s.notifications && "Notification" in window && Notification.permission === "granted" && document.hidden) {
      try {
        new Notification(cur.mode === "focus" ? "Focus session complete 🎉" : "Break's over ⏰", {
          body: cur.mode === "focus" ? "Take a breather — you earned it." : "Back to flow. You've got this.",
          icon: "/logo.svg",
        });
      } catch {
        /* some browsers only allow notifications from a service worker */
      }
    }
  }, [commit]);

  // Ticking: wall-clock based, so it stays accurate in background tabs.
  useEffect(() => {
    if (!state.running) {
      setRemainingSec(Math.ceil(state.remainingMs / 1000));
      return;
    }
    const tick = () => {
      const cur = stateRef.current;
      if (!cur.running || !cur.endAt) return;
      const left = cur.endAt - Date.now();
      if (left <= 0) complete();
      else setRemainingSec(Math.ceil(left / 1000));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [state.running, state.endAt, state.remainingMs, complete]);

  // If durations change while the timer is untouched, pick them up.
  useEffect(() => {
    const cur = stateRef.current;
    if (cur.running || !cur.fresh) return;
    const total = durationMs(settings, cur.mode);
    if (total !== cur.totalMs) commit({ ...cur, remainingMs: total, totalMs: total });
  }, [settings, commit]);

  const start = useCallback(() => {
    const cur = stateRef.current;
    if (cur.running) return;
    const rem = cur.remainingMs > 0 ? cur.remainingMs : cur.totalMs;
    commit({ ...cur, running: true, endAt: Date.now() + rem, remainingMs: rem, fresh: false });
  }, [commit]);

  const pause = useCallback(() => {
    const cur = stateRef.current;
    if (!cur.running) return;
    commit({ ...cur, running: false, endAt: null, remainingMs: remainingOf(cur) });
  }, [commit]);

  const toggle = useCallback(() => (stateRef.current.running ? pause() : start()), [pause, start]);

  const reset = useCallback(() => {
    const cur = stateRef.current;
    const total = durationMs(settingsRef.current, cur.mode);
    commit({ ...cur, running: false, endAt: null, remainingMs: total, totalMs: total, fresh: true });
  }, [commit]);

  const switchMode = useCallback(
    (m: Mode) => {
      const cur = stateRef.current;
      const total = durationMs(settingsRef.current, m);
      commit({ ...cur, mode: m, running: false, endAt: null, remainingMs: total, totalMs: total, fresh: true });
    },
    [commit]
  );

  const skip = useCallback(() => {
    const cur = stateRef.current;
    const s = settingsRef.current;
    const nextMode: Mode = cur.mode === "focus" ? ((cur.cycle + 1) % s.longEvery === 0 ? "long" : "short") : "focus";
    const total = durationMs(s, nextMode);
    commit({
      mode: nextMode,
      cycle: cur.mode === "long" ? 0 : cur.cycle,
      running: cur.running,
      endAt: cur.running ? Date.now() + total : null,
      remainingMs: total,
      totalMs: total,
      fresh: !cur.running,
    });
  }, [commit]);

  const addMinutes = useCallback(
    (n: number) => {
      const cur = stateRef.current;
      const add = n * 60_000;
      commit({
        ...cur,
        endAt: cur.endAt ? cur.endAt + add : null,
        remainingMs: cur.remainingMs + add,
        totalMs: cur.totalMs + add,
        fresh: false,
      });
    },
    [commit]
  );

  // Tab title countdown
  useEffect(() => {
    const base = "Collabs Flow";
    if (settings.titleCountdown && (state.running || !state.fresh)) {
      document.title = `${formatClock(remainingSec)} · ${MODE_LABEL[state.mode]} — ${base}`;
    } else document.title = `${base} — Study in flow`;
  }, [remainingSec, state.mode, state.running, state.fresh, settings.titleCountdown]);

  const control = useMemo<ControlCtx>(
    () => ({
      mode: state.mode,
      running: state.running,
      cycle: state.cycle,
      fresh: state.fresh,
      start,
      pause,
      toggle,
      reset,
      skip,
      switchMode,
      addMinutes,
    }),
    [state.mode, state.running, state.cycle, state.fresh, start, pause, toggle, reset, skip, switchMode, addMinutes]
  );

  const clock = useMemo<ClockCtx>(() => {
    const total = Math.round(state.totalMs / 1000);
    return { remaining: remainingSec, total, progress: total ? 1 - remainingSec / total : 0 };
  }, [remainingSec, state.totalMs]);

  return (
    <ControlContext.Provider value={control}>
      <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>
    </ControlContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(ControlContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}

export function useTimerClock() {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error("useTimerClock must be used inside TimerProvider");
  return ctx;
}
