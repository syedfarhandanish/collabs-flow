"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { getAmbientEngine, type AmbientId } from "@/lib/ambient";
import { usePersistentState } from "@/lib/storage";

type Levels = Record<AmbientId, number>;

interface AmbientState {
  levels: Levels; // remembered slider positions
  active: AmbientId[];
  master: number;
}

const DEFAULT: AmbientState = {
  levels: { rain: 0.5, waves: 0.5, wind: 0.35, fire: 0.5, brown: 0.4, white: 0.25 },
  active: [],
  master: 0.8,
};

export const AMBIENT_PRESETS: Array<{ name: string; emoji: string; mix: Partial<Levels> }> = [
  { name: "Rainy night", emoji: "🌧️", mix: { rain: 0.6, wind: 0.2 } },
  { name: "Seaside", emoji: "🌊", mix: { waves: 0.65, wind: 0.2 } },
  { name: "Cozy cabin", emoji: "🔥", mix: { fire: 0.6, rain: 0.3 } },
  { name: "Deep focus", emoji: "🧠", mix: { brown: 0.55 } },
];

interface Ctx extends AmbientState {
  toggle: (id: AmbientId) => void;
  setLevel: (id: AmbientId, v: number) => void;
  setMaster: (v: number) => void;
  applyPreset: (mix: Partial<Levels>) => void;
  stopAll: () => void;
}

const AmbientContext = createContext<Ctx | null>(null);

export function AmbientProvider({ children }: { children: ReactNode }) {
  // Sounds never auto-start on load (browsers block audio before a click), so `active` starts empty.
  const [state, setState] = usePersistentState<AmbientState>("cf:ambient", () => DEFAULT, (s) => ({
    ...DEFAULT,
    ...(s as Partial<AmbientState>),
    active: [],
  }));
  const started = useRef(false);

  const sync = useCallback((next: AmbientState) => {
    if (!started.current && next.active.length === 0) return;
    started.current = true;
    const engine = getAmbientEngine();
    engine.setMaster(next.master);
    (Object.keys(next.levels) as AmbientId[]).forEach((id) => {
      engine.setLevel(id, next.active.includes(id) ? next.levels[id] : 0);
    });
  }, []);

  const apply = useCallback(
    (fn: (s: AmbientState) => AmbientState) => {
      setState((prev) => {
        const next = fn(prev);
        sync(next);
        return next;
      });
    },
    [setState, sync]
  );

  const toggle = useCallback(
    (id: AmbientId) =>
      apply((s) => ({
        ...s,
        active: s.active.includes(id) ? s.active.filter((a) => a !== id) : [...s.active, id],
      })),
    [apply]
  );

  const setLevel = useCallback(
    (id: AmbientId, v: number) =>
      apply((s) => ({
        ...s,
        levels: { ...s.levels, [id]: v },
        active: s.active.includes(id) ? s.active : [...s.active, id],
      })),
    [apply]
  );

  const setMaster = useCallback((v: number) => apply((s) => ({ ...s, master: v })), [apply]);

  const applyPreset = useCallback(
    (mix: Partial<Levels>) =>
      apply((s) => ({
        ...s,
        levels: { ...s.levels, ...mix },
        active: Object.keys(mix) as AmbientId[],
      })),
    [apply]
  );

  const stopAll = useCallback(() => apply((s) => ({ ...s, active: [] })), [apply]);

  useEffect(() => () => {
    if (started.current) {
      const engine = getAmbientEngine();
      (Object.keys(DEFAULT.levels) as AmbientId[]).forEach((id) => engine.setLevel(id, 0));
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...state, toggle, setLevel, setMaster, applyPreset, stopAll }),
    [state, toggle, setLevel, setMaster, applyPreset, stopAll]
  );
  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}

export function useAmbient() {
  const ctx = useContext(AmbientContext);
  if (!ctx) throw new Error("useAmbient must be used inside AmbientProvider");
  return ctx;
}
