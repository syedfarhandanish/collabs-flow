"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { STATIONS, type Station } from "@/lib/content";
import { usePersistentState } from "@/lib/storage";
import { loadYouTubeAPI, parseYouTubeUrl, resolveLiveVideo, YT_STATE, type YTPlayer } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { useSettings } from "./SettingsContext";
import { useTimer } from "./TimerContext";

export type MusicStatus = "loading" | "idle" | "playing" | "paused" | "buffering" | "error";

interface Prefs {
  stationId: string;
  volume: number; // 0..100
  muted: boolean;
}

interface Ctx {
  stations: Station[];
  station: Station;
  status: MusicStatus;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  ducked: boolean;
  nowTitle: string;
  nowAuthor: string;
  nowVideoId: string | null;
  videoVisible: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (id: string) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setVideoVisible: (v: boolean) => void;
  addFromUrl: (url: string) => boolean;
  removeStation: (id: string) => void;
  getProgress: () => { current: number; duration: number };
  seek: (fraction: number) => void;
}

const MusicContext = createContext<Ctx | null>(null);

const DUCK_LEVEL = 0.35;

export function MusicProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const timer = useTimer();

  const [custom, setCustom] = usePersistentState<Station[]>("cf:stations", () => []);
  const [prefs, setPrefs] = usePersistentState<Prefs>(
    "cf:music",
    () => ({ stationId: STATIONS[0].id, volume: 60, muted: false }),
    (s) => ({ stationId: STATIONS[0].id, volume: 60, muted: false, ...(s as Partial<Prefs>) })
  );
  const stations = useMemo(() => [...STATIONS, ...custom], [custom]);
  const station = stations.find((s) => s.id === prefs.stationId) ?? stations[0];

  const [status, setStatus] = useState<MusicStatus>("loading");
  const [meta, setMeta] = useState<{ title: string; author: string; videoId: string | null }>({
    title: "",
    author: "",
    videoId: null,
  });
  const [videoVisible, setVideoVisible] = useState(false);
  const [ducked, setDucked] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const loadedRef = useRef<string | null>(null);
  const wantPlayRef = useRef(false);
  const fadeInRef = useRef(false);
  const fadeTimer = useRef<number | null>(null);
  const volNow = useRef(0);
  const duckRef = useRef(1);
  const failed = useRef(new Set<string>());
  const pausedByBreak = useRef(false);
  const liveIds = useRef<Record<string, string>>({});

  const stationRef = useRef(station);
  stationRef.current = station;
  const stationsRef = useRef(stations);
  stationsRef.current = stations;
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const target = useCallback(
    () => (prefsRef.current.muted ? 0 : Math.round(prefsRef.current.volume * duckRef.current)),
    []
  );

  const setVol = (v: number) => {
    volNow.current = v;
    playerRef.current?.setVolume(v);
  };

  const fadeTo = useCallback((to: number, ms: number, done?: () => void) => {
    if (fadeTimer.current) window.clearInterval(fadeTimer.current);
    const from = volNow.current;
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    fadeTimer.current = window.setInterval(() => {
      i++;
      const t = i / steps;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setVol(Math.round(from + (to - from) * eased));
      if (i >= steps) {
        if (fadeTimer.current) window.clearInterval(fadeTimer.current);
        fadeTimer.current = null;
        done?.();
      }
    }, 40);
  }, []);

  const loadStation = useCallback((s: Station, autoplay: boolean) => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    loadedRef.current = s.id;
    if (autoplay) {
      fadeInRef.current = true;
      setVol(0);
    }
    if (s.kind === "playlist") {
      const opts = { list: s.ytId, listType: "playlist" as const };
      if (autoplay) p.loadPlaylist(opts);
      else p.cuePlaylist(opts);
      window.setTimeout(() => {
        try {
          p.setLoop(true);
        } catch {
          /* not ready yet */
        }
      }, 800);
    } else {
      const id = liveIds.current[s.id] ?? s.ytId;
      if (autoplay) p.loadVideoById(id);
      else p.cueVideoById(id);
    }
    setMeta({ title: "", author: "", videoId: s.kind === "video" ? liveIds.current[s.id] ?? s.ytId : null });
  }, []);

  const play = useCallback(() => {
    wantPlayRef.current = true;
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (loadedRef.current !== stationRef.current.id) {
      loadStation(stationRef.current, true);
      return;
    }
    fadeInRef.current = true;
    setVol(0);
    p.playVideo();
  }, [loadStation]);

  const pause = useCallback(() => {
    wantPlayRef.current = false;
    pausedByBreak.current = false;
    fadeInRef.current = false;
    fadeTo(0, 600, () => playerRef.current?.pauseVideo());
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (wantPlayRef.current) pause();
    else play();
  }, [pause, play]);

  const select = useCallback(
    (id: string) => {
      const s = stationsRef.current.find((x) => x.id === id);
      if (!s) return;
      setPrefs((p) => ({ ...p, stationId: id }));
      stationRef.current = s;
      wantPlayRef.current = true;
      if (fadeTimer.current) window.clearInterval(fadeTimer.current);
      loadStation(s, true);
    },
    [loadStation, setPrefs]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const cur = stationRef.current;
      if (cur.kind === "playlist" && playerRef.current) {
        if (dir === 1) playerRef.current.nextVideo();
        else playerRef.current.previousVideo();
        return;
      }
      const list = stationsRef.current;
      const idx = list.findIndex((s) => s.id === cur.id);
      select(list[(idx + dir + list.length) % list.length].id);
    },
    [select]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const setVolume = useCallback(
    (v: number) => {
      const vol = Math.max(0, Math.min(100, Math.round(v)));
      prefsRef.current = { ...prefsRef.current, volume: vol, muted: false };
      setPrefs((p) => ({ ...p, volume: vol, muted: false }));
      if (fadeTimer.current) {
        window.clearInterval(fadeTimer.current);
        fadeTimer.current = null;
        if (!wantPlayRef.current) {
          // A fade-out was in progress – finish the pause immediately.
          playerRef.current?.pauseVideo();
          return;
        }
      }
      if (wantPlayRef.current) setVol(target());
    },
    [setPrefs, target]
  );

  const toggleMute = useCallback(() => {
    const muted = !prefsRef.current.muted;
    prefsRef.current = { ...prefsRef.current, muted };
    setPrefs((p) => ({ ...p, muted }));
    if (wantPlayRef.current) fadeTo(target(), 300);
  }, [setPrefs, fadeTo, target]);

  const addFromUrl = useCallback(
    (url: string) => {
      const parsed = parseYouTubeUrl(url);
      if (!parsed) {
        toast.error("That doesn't look like a YouTube link", {
          description: "Paste a video, live stream or playlist URL.",
        });
        return false;
      }
      const existing = stationsRef.current.find((s) => s.ytId === parsed.id);
      if (existing) {
        select(existing.id);
        return true;
      }
      const s: Station = {
        id: `custom-${parsed.id}`,
        kind: parsed.kind,
        ytId: parsed.id,
        title: parsed.kind === "playlist" ? "My playlist" : "My track",
        subtitle: parsed.kind === "playlist" ? "YouTube playlist" : "YouTube",
        mood: "Mine",
        custom: true,
      };
      setCustom((c) => [...c, s]);
      stationsRef.current = [...stationsRef.current, s];
      select(s.id);
      toast.success("Added to your stations");
      return true;
    },
    [select, setCustom]
  );

  const removeStation = useCallback(
    (id: string) => {
      setCustom((c) => c.filter((s) => s.id !== id));
      if (prefsRef.current.stationId === id) {
        setPrefs((p) => ({ ...p, stationId: STATIONS[0].id }));
        if (wantPlayRef.current) select(STATIONS[0].id);
      }
    },
    [setCustom, setPrefs, select]
  );

  const getProgress = useCallback(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return { current: 0, duration: 0 };
    try {
      return { current: p.getCurrentTime() || 0, duration: p.getDuration() || 0 };
    } catch {
      return { current: 0, duration: 0 };
    }
  }, []);

  const seek = useCallback((fraction: number) => {
    const p = playerRef.current;
    if (!p) return;
    const d = p.getDuration();
    if (d > 0) p.seekTo(d * fraction, true);
  }, []);

  // Event handlers live in a ref so the player (created once) always calls the latest logic.
  const handlers = useRef({
    onState: (s: number) => void s,
    onError: (code: number) => void code,
  });
  handlers.current.onState = (s: number) => {
    const p = playerRef.current;
    if (s === YT_STATE.PLAYING) {
      setStatus("playing");
      failed.current.delete(stationRef.current.id);
      if (!wantPlayRef.current) {
        // Started from the video's own controls
        wantPlayRef.current = true;
      }
      if (fadeInRef.current) {
        fadeInRef.current = false;
        fadeTo(target(), 1600);
      } else if (!fadeTimer.current) setVol(target());
      const data = p?.getVideoData?.();
      if (data) {
        setMeta({ title: data.title ?? "", author: data.author ?? "", videoId: data.video_id ?? null });
        const cur = stationRef.current;
        if (cur.custom && cur.kind === "video" && data.title && cur.title === "My track") {
          setCustom((c) =>
            c.map((x) => (x.id === cur.id ? { ...x, title: data.title!, subtitle: data.author || "YouTube" } : x))
          );
        }
      }
    } else if (s === YT_STATE.BUFFERING) setStatus("buffering");
    else if (s === YT_STATE.PAUSED) {
      setStatus("paused");
      if (!fadeTimer.current) wantPlayRef.current = false;
    } else if (s === YT_STATE.ENDED) {
      if (stationRef.current.kind === "video") p?.playVideo();
    } else if (s === YT_STATE.CUED) setStatus((st) => (st === "loading" ? "idle" : st === "playing" ? st : "idle"));
  };
  handlers.current.onError = (code: number) => {
    const cur = stationRef.current;
    failed.current.add(cur.id);
    const list = stationsRef.current;
    const reason = code === 101 || code === 150 ? "doesn't allow embedding" : "is unavailable right now";
    if (failed.current.size >= list.length) {
      setStatus("error");
      toast.error("No stations could be played", { description: "Check your connection or ad blocker." });
      return;
    }
    if (!wantPlayRef.current) {
      setStatus("error");
      return;
    }
    toast(`“${cur.title}” ${reason}`, { description: "Skipping to the next station…" });
    const idx = list.findIndex((s) => s.id === cur.id);
    for (let i = 1; i <= list.length; i++) {
      const cand = list[(idx + i) % list.length];
      if (!failed.current.has(cand.id)) {
        window.setTimeout(() => select(cand.id), 400);
        return;
      }
    }
  };

  // Create the player once – it is never unmounted, so music never cuts out while you navigate the UI.
  useEffect(() => {
    let cancelled = false;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "100%";
    wrap.appendChild(el);

    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(el, {
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 0, controls: 1, rel: 0, playsinline: 1, iv_load_policy: 3, modestbranding: 1 },
          events: {
            onReady: () => {
              readyRef.current = true;
              setVol(0);
              setStatus("idle");
              if (wantPlayRef.current) loadStation(stationRef.current, true);
              else loadStation(stationRef.current, false);
            },
            onStateChange: (e) => handlers.current.onState(e.data),
            onError: (e) => handlers.current.onError(e.data),
          },
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      readyRef.current = false;
      wrap.innerHTML = "";
    };
  }, [loadStation]);

  // Resolve the current live stream for stations that know their channel (only with an API key).
  useEffect(() => {
    STATIONS.filter((s) => s.channelId).forEach((s) => {
      void resolveLiveVideo(s.channelId!).then((id) => {
        if (!id) return;
        liveIds.current[s.id] = id;
        // If this station was already cued with the old ID and isn't playing yet, re-cue the live one.
        if (loadedRef.current === s.id && !wantPlayRef.current) loadStation(s, false);
      });
    });
  }, [loadStation]);

  // React to the timer: duck or pause during breaks, resume for focus.
  const prevMode = useRef(timer.mode);
  useEffect(() => {
    if (prevMode.current === timer.mode) return;
    prevMode.current = timer.mode;
    const isBreak = timer.mode !== "focus";
    if (isBreak) {
      if (settings.musicOnBreak === "pause" && wantPlayRef.current) {
        pause();
        pausedByBreak.current = true;
      } else if (settings.musicOnBreak === "lower") {
        duckRef.current = DUCK_LEVEL;
        setDucked(true);
        if (wantPlayRef.current) fadeTo(target(), 1500);
      }
    } else {
      duckRef.current = 1;
      setDucked(false);
      if (pausedByBreak.current) {
        pausedByBreak.current = false;
        play();
      } else if (wantPlayRef.current) fadeTo(target(), 1500);
    }
  }, [timer.mode, settings.musicOnBreak, pause, play, fadeTo, target]);

  // Start the music together with a focus session.
  const prevRunning = useRef(timer.running);
  useEffect(() => {
    const started = timer.running && !prevRunning.current;
    prevRunning.current = timer.running;
    if (started && timer.mode === "focus" && settings.autoPlayMusic && !wantPlayRef.current) play();
  }, [timer.running, timer.mode, settings.autoPlayMusic, play]);

  const value = useMemo<Ctx>(
    () => ({
      stations,
      station,
      status,
      isPlaying: status === "playing" || status === "buffering",
      volume: prefs.volume,
      muted: prefs.muted,
      ducked,
      nowTitle: meta.title,
      nowAuthor: meta.author,
      nowVideoId: meta.videoId ?? (station.kind === "video" ? station.ytId : null),
      videoVisible,
      play,
      pause,
      toggle,
      next,
      prev,
      select,
      setVolume,
      toggleMute,
      setVideoVisible,
      addFromUrl,
      removeStation,
      getProgress,
      seek,
    }),
    [stations, station, status, prefs.volume, prefs.muted, ducked, meta, videoVisible, play, pause, toggle, next, prev, select, setVolume, toggleMute, addFromUrl, removeStation, getProgress, seek]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Persistent YouTube player. Kept on-screen (but invisible) when hidden so browsers don't throttle it. */}
      <div
        className={cn(
          "fixed z-40 overflow-hidden transition-all duration-500 ease-out",
          videoVisible
            ? "bottom-4 left-4 h-[180px] w-[320px] rounded-2xl opacity-100 shadow-2xl shadow-black/60 ring-1 ring-white/15 max-sm:w-[calc(100vw-2rem)] max-sm:h-[calc((100vw-2rem)*0.5625)]"
            : "pointer-events-none bottom-0 left-0 h-[113px] w-[200px] opacity-0"
        )}
        aria-hidden={!videoVisible}
      >
        <div ref={wrapRef} className="h-full w-full" />
        {videoVisible && (
          <button
            onClick={() => setVideoVisible(false)}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white/80 backdrop-blur transition hover:bg-black hover:text-white"
            aria-label="Hide video"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}
