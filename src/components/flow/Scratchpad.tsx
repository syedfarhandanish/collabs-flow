"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, NotebookPen, Trash2 } from "lucide-react";
import { usePersistentState } from "@/lib/storage";

export function Scratchpad() {
  const [text, setText] = usePersistentState<string>("cf:notes", () => "");
  const [draft, setDraft] = useState(text);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (draft === text) return;
    setSaved(false);
    const id = window.setTimeout(() => {
      setText(draft);
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(id);
  }, [draft, text, setText]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="glass flex h-full min-h-[300px] flex-col p-5 sm:p-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <NotebookPen className="h-4 w-4 text-c3" /> Brain Dump
        </h2>
        <span className="flex items-center gap-1 text-[11px] text-white/40">
          {saved ? (
            <>
              <Check className="h-3 w-3 text-emerald-300" /> Saved
            </>
          ) : (
            "Saving…"
          )}
        </span>
      </div>
      <p className="mb-3 text-xs text-white/45">Distracting thought mid-session? Park it here and get back to flow.</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={"• Email teacher about deadline\n• Formula to look up later\n• Buy notebook"}
        className="min-h-[160px] w-full flex-1 resize-none rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-sm leading-relaxed text-white/90 outline-none transition placeholder:text-white/25 focus:border-white/20"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
        <span>{words} words</span>
        {draft && (
          <button onClick={() => setDraft("")} className="flex items-center gap-1 hover:text-white/70">
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
    </motion.section>
  );
}
