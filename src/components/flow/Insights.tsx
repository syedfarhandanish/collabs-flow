"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStats } from "@/contexts/StatsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { addDays, dayKey, formatMinutes } from "@/lib/dates";
import { cn } from "@/lib/utils";

const WEEKS = 18;

export function Insights() {
  const { days, totalFocusMin, totalSessions, longestStreak } = useStats();
  const { settings } = useSettings();

  const week = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      const stat = days[dayKey(d)];
      return {
        key: dayKey(d),
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        min: stat?.focusMin ?? 0,
        isToday: i === 6,
      };
    });
  }, [days]);

  const heat = useMemo(() => {
    const today = new Date();
    // Columns are weeks (Sun→Sat); the last column is the current week.
    const end = today;
    const first = addDays(today, -(WEEKS * 7 - 1) + (6 - today.getDay()));
    const cells: Array<{ key: string; min: number; date: Date; future: boolean }> = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = addDays(first, i);
      cells.push({ key: dayKey(d), min: days[dayKey(d)]?.focusMin ?? 0, date: d, future: d > end });
    }
    return cells;
  }, [days]);

  const weekTotal = week.reduce((a, d) => a + d.min, 0);
  const max = Math.max(settings.dailyGoalMin, ...week.map((d) => d.min), 1);
  const goalLine = settings.dailyGoalMin / max;

  const level = (min: number) => {
    if (min <= 0) return 0;
    const g = settings.dailyGoalMin || 120;
    if (min < g * 0.25) return 1;
    if (min < g * 0.6) return 2;
    if (min < g) return 3;
    return 4;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="glass h-full p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">
          <BarChart3 className="h-4 w-4 text-c2" /> Insights
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="chip">This week · <b className="text-white">{formatMinutes(weekTotal)}</b></span>
          <span className="chip">All time · <b className="text-white">{formatMinutes(totalFocusMin)}</b></span>
          <span className="chip">{totalSessions} sessions</span>
          <span className="chip">Best streak · {longestStreak}d</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Weekly bars */}
        <div>
          <p className="mb-3 text-xs text-white/45">Last 7 days</p>
          <div className="relative flex h-36 items-end gap-2.5">
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/20"
              style={{ bottom: `${goalLine * 100}%` }}
            >
              <span className="absolute -top-4 right-0 text-[10px] text-white/35">goal</span>
            </div>
            {week.map((d, i) => (
              <Tooltip key={d.key}>
                <TooltipTrigger asChild>
                  <div className="flex h-full flex-1 items-end">
                    <motion.div
                      className={cn(
                        "w-full rounded-lg",
                        d.min > 0 ? "bg-gradient-to-t from-c1/70 to-c2" : "bg-white/[0.06]",
                        d.isToday && d.min > 0 && "shadow-[0_0_24px_-4px_rgb(var(--c2)/0.8)]"
                      )}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(3, (d.min / max) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{formatMinutes(d.min)} focused</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="mt-2 flex gap-2.5">
            {week.map((d) => (
              <span key={d.key} className={cn("flex-1 text-center text-[11px]", d.isToday ? "font-semibold text-white" : "text-white/40")}>
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div>
          <p className="mb-3 text-xs text-white/45">Consistency · last {WEEKS} weeks</p>
          <div className="no-scrollbar overflow-x-auto">
            <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
              {heat.map((c) => {
                const l = level(c.min);
                return (
                  <Tooltip key={c.key}>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "h-3 w-3 rounded-[3px] sm:h-[13px] sm:w-[13px]",
                          c.future ? "opacity-0" : l === 0 && "bg-white/[0.06]"
                        )}
                        style={l > 0 && !c.future ? { backgroundColor: `rgb(var(--c1) / ${[0, 0.3, 0.5, 0.75, 1][l]})` } : undefined}
                      />
                    </TooltipTrigger>
                    {!c.future && (
                      <TooltipContent>
                        {c.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {formatMinutes(c.min)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/40">
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className={cn("h-2.5 w-2.5 rounded-[3px]", l === 0 && "bg-white/[0.06]")}
                style={l > 0 ? { backgroundColor: `rgb(var(--c1) / ${[0, 0.3, 0.5, 0.75, 1][l]})` } : undefined}
              />
            ))}
            More
          </div>
        </div>
      </div>
    </motion.section>
  );
}
