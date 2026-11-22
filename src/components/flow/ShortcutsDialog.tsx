"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/contexts/UIContext";

const KEYS: Array<[string, string]> = [
  ["Space", "Start / pause timer"],
  ["R", "Reset timer"],
  ["S", "Skip to next session"],
  ["1 · 2 · 3", "Focus · short break · long break"],
  ["M", "Play / pause music"],
  ["N", "Next station"],
  ["Z", "Toggle zen mode"],
  ["Esc", "Exit zen mode"],
  ["?", "Show this list"],
];

export function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useUI();
  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-md rounded-3xl border-white/10 bg-[#101019]/95 backdrop-blur-xl">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Stay in flow without touching the mouse.</DialogDescription>
        <div className="mt-2 divide-y divide-white/[0.06]">
          {KEYS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-white/70">{v}</span>
              <kbd className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 font-mono text-xs text-white">{k}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
