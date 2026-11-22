"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { readStorage, usePersistentState } from "@/lib/storage";
import type { ChimeKind } from "@/lib/sounds";

export type Scene = "aurora" | "sunset" | "ocean" | "forest" | "midnight" | "sakura";

export const SCENES: Array<{ id: Scene; name: string; colors: [string, string, string] }> = [
  { id: "aurora", name: "Aurora", colors: ["#8b5cf6", "#22d3ee", "#f472b6"] },
  { id: "sunset", name: "Sunset", colors: ["#fb7185", "#f59e0b", "#a855f7"] },
  { id: "ocean", name: "Ocean", colors: ["#3b82f6", "#2dd4bf", "#6366f1"] },
  { id: "forest", name: "Forest", colors: ["#10b981", "#a3e635", "#14b8a6"] },
  { id: "midnight", name: "Midnight", colors: ["#6366f1", "#e879f9", "#38bdf8"] },
  { id: "sakura", name: "Sakura", colors: ["#f472b6", "#c084fc", "#fda4af"] },
];

export interface Settings {
  name: string;
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  dailyGoalMin: number;
  scene: Scene;
  chime: ChimeKind;
  chimeVolume: number;
  notifications: boolean;
  titleCountdown: boolean;
  musicOnBreak: "keep" | "lower" | "pause";
  autoPlayMusic: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  dailyGoalMin: 120,
  scene: "aurora",
  chime: "bell",
  chimeVolume: 0.6,
  notifications: false,
  titleCountdown: true,
  musicOnBreak: "lower",
  autoPlayMusic: true,
};

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<Ctx | null>(null);

function migrate(stored: unknown): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) };
}

function initial(): Settings {
  // Carry over durations from the previous version of the app.
  const legacy = readStorage<{
    focusTime?: number;
    shortBreakTime?: number;
    longBreakTime?: number;
    cyclesBeforeLongBreak?: number;
  } | null>("timerSettings", null);
  if (!legacy) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    focusMin: legacy.focusTime || DEFAULT_SETTINGS.focusMin,
    shortMin: legacy.shortBreakTime || DEFAULT_SETTINGS.shortMin,
    longMin: legacy.longBreakTime || DEFAULT_SETTINGS.longMin,
    longEvery: legacy.cyclesBeforeLongBreak || DEFAULT_SETTINGS.longEvery,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = usePersistentState<Settings>("cf:settings", initial, migrate);
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [setSettings]
  );
  const value = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
