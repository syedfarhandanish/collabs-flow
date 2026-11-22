"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface Ctx {
  zen: boolean;
  setZen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
}

const UIContext = createContext<Ctx | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [zen, setZen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const value = useMemo(
    () => ({ zen, setZen, settingsOpen, setSettingsOpen, shortcutsOpen, setShortcutsOpen }),
    [zen, settingsOpen, shortcutsOpen]
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
