"use client";

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  setVolume(v: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  loadVideoById(id: string, startSeconds?: number): void;
  cueVideoById(id: string): void;
  loadPlaylist(opts: { list: string; listType: "playlist"; index?: number }): void;
  cuePlaylist(opts: { list: string; listType: "playlist"; index?: number }): void;
  setLoop(loop: boolean): void;
  setShuffle(shuffle: boolean): void;
  nextVideo(): void;
  previousVideo(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getVideoData?: () => { title?: string; author?: string; video_id?: string };
  destroy(): void;
}

interface YTEvent<T = unknown> {
  data: T;
  target: YTPlayer;
}

interface YTPlayerOptions {
  width?: string | number;
  height?: string | number;
  videoId?: string;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: YTEvent) => void;
    onStateChange?: (e: YTEvent<number>) => void;
    onError?: (e: YTEvent<number>) => void;
  };
}

export interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

let loading: Promise<YTNamespace> | null = null;

export function loadYouTubeAPI(): Promise<YTNamespace> {
  if (loading) return loading;
  loading = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load the YouTube player"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type ParsedYouTube = { kind: "video" | "playlist"; id: string };

/** Accepts watch / youtu.be / shorts / live / embed / playlist links or a bare 11-char id. */
export function parseYouTubeUrl(input: string): ParsedYouTube | null {
  const text = input.trim();
  if (/^[\w-]{11}$/.test(text)) return { kind: "video", id: text };
  let url: URL;
  try {
    url = new URL(text.startsWith("http") ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");
  if (!["youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) return null;

  const list = url.searchParams.get("list");
  let video = url.searchParams.get("v");
  if (host === "youtu.be") video = url.pathname.slice(1).split("/")[0] || null;
  const m = url.pathname.match(/^\/(?:shorts|live|embed|v)\/([\w-]{11})/);
  if (m) video = m[1];

  // Real playlists start with PL / OL / UU etc; RD = auto-mix, best treated as a video.
  if (list && !list.startsWith("RD") && (!video || url.pathname === "/playlist")) {
    return { kind: "playlist", id: list };
  }
  if (list && !list.startsWith("RD") && video) return { kind: "playlist", id: list };
  if (video && /^[\w-]{11}$/.test(video)) return { kind: "video", id: video };
  return null;
}

export function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

const liveCache = new Map<string, Promise<string | null>>();

/**
 * Finds the video currently live-streaming on a channel (needs NEXT_PUBLIC_YOUTUBE_API_KEY).
 * Lets curated radio stations survive when a channel restarts its stream under a new ID.
 */
export function resolveLiveVideo(channelId: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!key) return Promise.resolve(null);
  let pending = liveCache.get(channelId);
  if (!pending) {
    pending = fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${key}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { items?: Array<{ id?: { videoId?: string } }> } | null) => d?.items?.[0]?.id?.videoId ?? null)
      .catch(() => null);
    liveCache.set(channelId, pending);
  }
  return pending;
}
