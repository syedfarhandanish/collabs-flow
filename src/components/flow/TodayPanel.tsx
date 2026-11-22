"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Flame, Gauge, Sparkles, Timer } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useStats } from "@/contexts/StatsContext";
import { formatMinutes } from "@/lib/dates";
import { cn } from "@/lib/utils";

function GoalRing({ value, size = 148 }: { value: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, value);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id="goal-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c3))" />
          <stop offset="100%" stopColor="rgb(var(--c1))" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#goal-g)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - p) }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export function TodayPanel() {
  const { settings } = useSettings();
  const s = useStats();
  const goal = settings.dailyGoalMin;
  const pct = goal ? s.today.focusMin / goal : 0;

  const tiles = [
    { label: "Sessions today", value: s.today.sessions, icon: Timer, color: "text-c2" },
    { label: "Tasks done today", value: s.today.tasks, icon: CheckCircle2, color: "text-emerald-300" },
    { label: "Current streak", value: `${s.streak}d`, icon: Flame, color: "text-orange-300" },
    { label: "Total XP", value: s.xp, icon: Sparkles, color: "text-c3" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="glass flex h-full flex-col p-5 sm:p-6"
    >
      <h2 className="section-title mb-5">
        <Gauge className="h-4 w-4 text-c1" /> Today
      </h2>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <GoalRing value={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular text-white">{Math.round(pct * 100)}%</span>
            <span className="text-[11px] text-white/45">of daily goal</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-white">{formatMinutes(s.today.focusMin)}</p>
          <p className="text-sm text-white/50">focused of {formatMinutes(goal)}</p>
          <p className={cn("mt-3 text-xs", pct >= 1 ? "text-emerald-300" : "text-white/40")}>
            {pct >= 1 ? "Goal smashed! Bonus round?" : `${Math.ceil(Math.max(0, goal - s.today.focusMin) / settings.focusMin)} more session(s) to go`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {tiles.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-soft p-3">
            <Icon className={cn("h-4 w-4", color)} />
            <p className="mt-2 text-xl font-semibold tabular text-white">{value}</p>
            <p className="text-[11px] text-white/45">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">
            Level {s.level.level} · <span className="text-white">{s.level.title}</span>
          </span>
          <span className="tabular text-white/40">
            {s.level.into}/{s.level.span} XP
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="h-full rounded-full bg-accent-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${s.level.progress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-[11px] text-white/35">+1 XP per focused minute · +10 XP per finished task</p>
      </div>
    </motion.section>
  );
}
