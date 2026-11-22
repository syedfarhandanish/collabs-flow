"use client";

import { Flame, Keyboard, Maximize2, Palette, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCENES, useSettings } from "@/contexts/SettingsContext";
import { useStats } from "@/contexts/StatsContext";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-accent-gradient btn-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 12c2.5-4 5.5-4 8 0s5.5 4 8 0" />
          <path d="M3 17c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity="0.55" />
          <path d="M3 7c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity="0.3" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white">
        collabs<span className="text-gradient">flow</span>
      </span>
    </div>
  );
}

function IconAction({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} className="icon-btn" aria-label={label}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function Header() {
  const { settings, update } = useSettings();
  const { streak, level } = useStats();
  const ui = useUI();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07070c]/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="chip hidden h-10 px-3.5 sm:inline-flex">
                <Flame className={cn("h-4 w-4", streak > 0 ? "fill-orange-400 text-orange-400" : "text-white/40")} />
                <span className="tabular font-semibold text-white">{streak}</span>
                <span className="text-white/50">day streak</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Finish at least one focus session a day to keep your streak</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="chip h-10 gap-2.5 px-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-gradient text-[11px] font-bold text-white">
                  {level.level}
                </span>
                <div className="hidden w-24 md:block">
                  <div className="text-[11px] leading-none text-white/70">{level.title}</div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-accent-gradient"
                      initial={false}
                      animate={{ width: `${Math.round(level.progress * 100)}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    />
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Level {level.level} · {level.into}/{level.span} XP to next level
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button className="icon-btn" aria-label="Change scene">
                    <Palette className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Scene</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-64 rounded-2xl border-white/10 bg-[#12121c]/95 p-3 backdrop-blur-xl">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-widest text-white/50">Scene</p>
              <div className="grid grid-cols-3 gap-2">
                {SCENES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => update({ scene: s.id })}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-xl p-2 transition hover:bg-white/5",
                      settings.scene === s.id && "bg-white/[0.07] ring-1 ring-white/20"
                    )}
                  >
                    <span
                      className="h-10 w-10 rounded-full shadow-lg transition group-hover:scale-110"
                      style={{ background: `conic-gradient(from 200deg, ${s.colors[0]}, ${s.colors[1]}, ${s.colors[2]}, ${s.colors[0]})` }}
                    />
                    <span className="text-[11px] text-white/70">{s.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <span className="hidden sm:contents">
            <IconAction label="Keyboard shortcuts (?)" onClick={() => ui.setShortcutsOpen(true)}>
              <Keyboard className="h-4 w-4" />
            </IconAction>
          </span>
          <IconAction label="Zen mode (Z)" onClick={() => ui.setZen(true)}>
            <Maximize2 className="h-4 w-4" />
          </IconAction>
          <IconAction label="Settings" onClick={() => ui.setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </header>
  );
}
