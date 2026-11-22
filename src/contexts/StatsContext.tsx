"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/lib/storage";
import { addDays, dayKey } from "@/lib/dates";
import { levelFromXp } from "@/lib/content";

export interface DayStat {
  focusMin: number;
  sessions: number;
  tasks: number;
}

interface StatsData {
  days: Record<string, DayStat>;
  totalSessions: number;
  totalFocusMin: number;
  tasksDone: number;
  longestStreak: number;
  earlyBird: boolean;
  nightOwl: boolean;
}

const EMPTY: StatsData = {
  days: {},
  totalSessions: 0,
  totalFocusMin: 0,
  tasksDone: 0,
  longestStreak: 0,
  earlyBird: false,
  nightOwl: false,
};

const EMPTY_DAY: DayStat = { focusMin: 0, sessions: 0, tasks: 0 };

function currentStreak(days: Record<string, DayStat>) {
  let cursor = new Date();
  if (!days[dayKey(cursor)]?.sessions) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days[dayKey(cursor)]?.sessions) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

interface Ctx extends StatsData {
  today: DayStat;
  streak: number;
  xp: number;
  level: ReturnType<typeof levelFromXp>;
  bestDayMin: number;
  recordFocus: (minutes: number) => void;
  recordTask: (delta: 1 | -1) => void;
  resetStats: () => void;
}

const StatsContext = createContext<Ctx | null>(null);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = usePersistentState<StatsData>("cf:stats", () => EMPTY, (s) => ({
    ...EMPTY,
    ...(s as Partial<StatsData>),
  }));

  const recordFocus = useCallback(
    (minutes: number) => {
      setData((prev) => {
        const now = new Date();
        const key = dayKey(now);
        const day = prev.days[key] ?? EMPTY_DAY;
        const days = {
          ...prev.days,
          [key]: { ...day, focusMin: day.focusMin + minutes, sessions: day.sessions + 1 },
        };
        const hour = now.getHours();
        return {
          ...prev,
          days,
          totalSessions: prev.totalSessions + 1,
          totalFocusMin: prev.totalFocusMin + minutes,
          longestStreak: Math.max(prev.longestStreak, currentStreak(days)),
          earlyBird: prev.earlyBird || hour < 8,
          nightOwl: prev.nightOwl || hour >= 22,
        };
      });
    },
    [setData]
  );

  const recordTask = useCallback(
    (delta: 1 | -1) => {
      setData((prev) => {
        const key = dayKey();
        const day = prev.days[key] ?? EMPTY_DAY;
        return {
          ...prev,
          days: { ...prev.days, [key]: { ...day, tasks: Math.max(0, day.tasks + delta) } },
          tasksDone: Math.max(0, prev.tasksDone + delta),
        };
      });
    },
    [setData]
  );

  const resetStats = useCallback(() => setData(EMPTY), [setData]);

  const value = useMemo<Ctx>(() => {
    const xp = Math.round(data.totalFocusMin + data.tasksDone * 10);
    const bestDayMin = Object.values(data.days).reduce((m, d) => Math.max(m, d.focusMin), 0);
    return {
      ...data,
      today: data.days[dayKey()] ?? EMPTY_DAY,
      streak: currentStreak(data.days),
      xp,
      level: levelFromXp(xp),
      bestDayMin,
      recordFocus,
      recordTask,
      resetStats,
    };
  }, [data, recordFocus, recordTask, resetStats]);

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used inside StatsProvider");
  return ctx;
}
