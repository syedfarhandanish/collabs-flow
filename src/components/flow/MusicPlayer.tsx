"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Link2,
  ListMusic,
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Tv,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMusic } from "@/contexts/MusicContext";
import { thumbnailFor } from "@/lib/youtube";
import { formatClock } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function Equalizer({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={cn("flex h-4 items-end gap-[3px]", className)} aria-hidden>
      {[0, 0.2, 0.4, 0.1].map((d, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-white", active ? "animate-eq" : "h-1")}
          style={active ? { height: "100%", animationDelay: `${d}s`, animationDuration: `${0.7 + i * 0.15}s` } : undefined}
        />
      ))}
    </span>
  );
}

function Progress({ live }: { live: boolean }) {
  const { getProgress, seek, isPlaying } = useMusic();
  const [p, setP] = useState({ current: 0, duration: 0 });
  useEffect(() => {
    const id = window.setInterval(() => setP(getProgress()), 1000);
    setP(getProgress());
    return () => window.clearInterval(id);
  }, [getProgress, isPlaying]);

  if (live || !p.duration) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-white/45">
        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold", live ? "bg-red-500/15 text-red-300" : "bg-white/5")}>
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
          {live ? "LIVE" : "—"}
        </span>
        <span>{live ? "24/7 stream" : "Ready"}</span>
      </div>
    );
  }
  const frac = p.current / p.duration;
  return (
    <div className="flex items-center gap-2 text-[11px] tabular text-white/45">
      <span className="w-9 text-right">{formatClock(p.current)}</span>
      <div
        className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seek((e.clientX - rect.left) / rect.width);
        }}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-accent-gradient" style={{ width: `${frac * 100}%` }} />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition group-hover:opacity-100"
          style={{ left: `${frac * 100}%` }}
        />
      </div>
      <span className="w-9">{formatClock(p.duration)}</span>
    </div>
  );
}

export function MusicPlayer() {
  const m = useMusic();
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumb = m.nowVideoId ? thumbnailFor(m.nowVideoId) : null;
  const title = m.nowTitle || m.station.title;
  const subtitle = m.nowAuthor && m.nowTitle ? m.nowAuthor : m.station.subtitle;
  const VolumeIcon = m.muted || m.volume === 0 ? VolumeX : m.volume < 50 ? Volume1 : Volume2;

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-station="${m.station.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [m.station.id]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.08 }}
      className="glass relative overflow-hidden p-5"
    >
      {/* blurred artwork backdrop */}
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          onError={(e) => (e.currentTarget.style.display = "none")}
          className={cn("pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover blur-3xl transition-opacity duration-1000", m.isPlaying ? "opacity-25" : "opacity-10")}
        />
      )}

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            <Music2 className="h-4 w-4 text-c2" /> Focus Music
          </h2>
          <div className="flex items-center gap-1.5">
            {m.ducked && m.isPlaying && <span className="chip py-0.5 text-[10px] text-rest">break · softer</span>}
            <span className="chip py-0.5 text-[10px]">
              <Radio className="h-3 w-3 text-red-400" /> YouTube
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => m.setVideoVisible(!m.videoVisible)}
                  className={cn("icon-btn h-8 w-8", m.videoVisible && "border-white/25 bg-white/15 text-white")}
                  aria-label="Toggle video"
                >
                  <Tv className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{m.videoVisible ? "Hide" : "Show"} video</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-accent-gradient shadow-xl ring-1 ring-white/10">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" onError={(e) => (e.currentTarget.style.visibility = "hidden")} className={cn("h-full w-full scale-[1.35] object-cover transition duration-700", m.isPlaying && "scale-[1.45]")} />
            ) : (
              <div className="grid h-full w-full place-items-center bg-accent-gradient">
                <ListMusic className="h-7 w-7 text-white" />
              </div>
            )}
            {m.isPlaying && (
              <div className="absolute inset-0 grid place-items-center bg-black/35">
                {m.status === "buffering" ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Equalizer active />}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white" title={title}>
              {title}
            </p>
            <p className="truncate text-sm text-white/55">{subtitle}</p>
            <div className="mt-2.5">
              {m.status === "error" ? (
                <p className="flex items-center gap-1.5 text-xs text-amber-300/90">
                  <AlertTriangle className="h-3.5 w-3.5" /> Couldn&apos;t reach YouTube — check your connection or ad blocker.
                </p>
              ) : (
                <Progress live={!!m.station.live} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="icon-btn" onClick={m.prev} aria-label="Previous station">
            <SkipBack className="h-4 w-4 fill-current" />
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={m.toggle}
            disabled={m.status === "loading"}
            className="btn-glow grid h-12 w-12 place-items-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-50"
            aria-label={m.isPlaying ? "Pause music" : "Play music"}
          >
            {m.status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : m.isPlaying ? (
              <Pause className="h-5 w-5 fill-black" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5 fill-black" />
            )}
          </motion.button>
          <button className="icon-btn" onClick={m.next} aria-label="Next station">
            <SkipForward className="h-4 w-4 fill-current" />
          </button>
          <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 pl-2 sm:max-w-[170px]">
            <button onClick={m.toggleMute} className="text-white/60 transition hover:text-white" aria-label="Mute">
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={m.muted ? 0 : m.volume}
              onChange={(e) => m.setVolume(Number(e.target.value))}
              className="range w-full"
              style={{ ["--val" as string]: `${m.muted ? 0 : m.volume}%` }}
              aria-label="Music volume"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Stations</p>
            <button
              onClick={() => setAdding((a) => !a)}
              className="flex items-center gap-1 text-xs text-white/50 transition hover:text-white"
            >
              <Link2 className="h-3.5 w-3.5" /> {adding ? "Close" : "Add from YouTube"}
            </button>
          </div>

          {adding && (
            <form
              className="mb-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (m.addFromUrl(url)) {
                  setUrl("");
                  setAdding(false);
                }
              }}
            >
              <input
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube video, live or playlist link"
                className="field h-10"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90">
                Play
              </button>
            </form>
          )}

          <div ref={stripRef} className="no-scrollbar mask-fade-x -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
            {m.stations.map((s) => {
              const active = s.id === m.station.id;
              return (
                <div key={s.id} data-station={s.id} className="group relative shrink-0">
                  <button
                    onClick={() => (active ? m.toggle() : m.select(s.id))}
                    className={cn(
                      "relative block h-[74px] w-[120px] overflow-hidden rounded-xl bg-gradient-to-br from-c1/60 to-c2/40 text-left ring-1 transition",
                      active ? "ring-2 ring-white/70" : "ring-white/10 hover:ring-white/30"
                    )}
                  >
                    {s.kind === "video" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailFor(s.ytId)}
                        alt=""
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        className="absolute inset-0 h-full w-full scale-125 object-cover transition duration-500 group-hover:scale-[1.35]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-accent-gradient opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <p className="truncate text-[11px] font-semibold leading-tight text-white">{s.title}</p>
                      <p className="text-[10px] text-white/60">{s.mood}</p>
                    </div>
                    {active && m.isPlaying && <Equalizer active className="absolute right-2 top-2 h-3" />}
                  </button>
                  {s.custom && (
                    <button
                      onClick={() => m.removeStation(s.id)}
                      className="absolute -right-1 -top-1 hidden rounded-full bg-black/80 p-1 text-white/70 ring-1 ring-white/20 hover:text-white group-hover:block"
                      aria-label="Remove station"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
