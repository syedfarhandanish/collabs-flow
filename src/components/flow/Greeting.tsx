"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, RefreshCw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useStats } from "@/contexts/StatsContext";
import { QUOTES } from "@/lib/content";
import { formatMinutes, greeting } from "@/lib/dates";

function dailyIndex() {
  const d = new Date();
  return (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % QUOTES.length;
}

export function Greeting() {
  const { settings } = useSettings();
  const { today } = useStats();
  const [qi, setQi] = useState(dailyIndex);
  const quote = QUOTES[qi];
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const left = Math.max(0, settings.dailyGoalMin - today.focusMin);

  return (
    <section className="flex flex-col gap-5 py-8 md:flex-row md:items-end md:justify-between md:py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">{date}</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {greeting()}
          {settings.name ? "," : ""}{" "}
          <span className="font-display font-normal italic text-gradient">
            {settings.name || "ready to flow?"}
          </span>
        </h2>
        <p className="mt-3 text-white/60">
          {today.sessions === 0
            ? "Pick a task, press start, and let the music carry you."
            : left > 0
              ? `${today.sessions} session${today.sessions > 1 ? "s" : ""} down · ${formatMinutes(left)} to today's goal. Keep going!`
              : "Daily goal reached — you're on fire today. 🔥"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-soft group relative max-w-md p-4 pr-10"
      >
        <Quote className="absolute left-4 top-4 h-4 w-4 text-c1" />
        <AnimatePresence mode="wait">
          <motion.div
            key={qi}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="pl-7"
          >
            <p className="font-display text-lg italic leading-snug text-white/85">“{quote.text}”</p>
            <p className="mt-1 text-xs text-white/45">— {quote.author}</p>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setQi((i) => (i + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="Another quote"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </section>
  );
}
