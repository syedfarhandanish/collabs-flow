"use client";

import { motion } from "framer-motion";
import { Lock, Medal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStats } from "@/contexts/StatsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ACHIEVEMENTS } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Achievements() {
  const s = useStats();
  const { settings } = useSettings();
  const input = {
    totalSessions: s.totalSessions,
    totalFocusMin: s.totalFocusMin,
    tasksDone: s.tasksDone,
    longestStreak: s.longestStreak,
    earlyBird: s.earlyBird,
    nightOwl: s.nightOwl,
    bestDayMin: s.bestDayMin,
    dailyGoalMin: settings.dailyGoalMin,
  };
  const list = ACHIEVEMENTS.map((a) => {
    const [v, target] = a.progress(input);
    return { ...a, value: Math.min(v, target), target, unlocked: v >= target };
  });
  const unlocked = list.filter((a) => a.unlocked).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="glass p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">
          <Medal className="h-4 w-4 text-amber-300" /> Achievements
        </h2>
        <span className="text-xs text-white/45">
          {unlocked}/{list.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {list.map((a, i) => {
          const Icon = a.icon;
          return (
            <Tooltip key={a.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-3 text-center",
                    a.unlocked ? "border-white/15 bg-white/[0.06]" : "border-white/[0.05] bg-white/[0.015]"
                  )}
                >
                  {a.unlocked && <div className="pointer-events-none absolute -top-8 h-16 w-16 rounded-full bg-c1/40 blur-2xl" />}
                  <div
                    className={cn(
                      "relative grid h-11 w-11 place-items-center rounded-full",
                      a.unlocked ? "bg-accent-gradient btn-glow text-white" : "bg-white/[0.05] text-white/25"
                    )}
                  >
                    {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <p className={cn("text-xs font-semibold leading-tight", a.unlocked ? "text-white" : "text-white/45")}>{a.title}</p>
                  {!a.unlocked && (
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-white/30" style={{ width: `${(a.value / a.target) * 100}%` }} />
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                {a.description}
                {!a.unlocked && ` · ${Math.round(a.value)}/${a.target}`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </motion.section>
  );
}
