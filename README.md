# Collabs Flow

A beautiful focus space for students — Pomodoro timer, lofi music from YouTube, ambient soundscapes, a study board, streaks and achievements, all in one calm, animated interface.

## Features

- **Focus timer** — Focus / short / long break modes, glowing progress ring, presets (25/5, 50/10, 15/3, 90/20), +1/+5 min, auto-start options. Wall-clock based, so it stays accurate in background tabs and survives a page reload. Countdown in the tab title, optional desktop notifications, choice of chime.
- **YouTube music** — Curated lofi / jazz / synthwave / classical stations, or paste any YouTube video, live stream or playlist. The player is created once and never unmounted, so music never cuts out. Volume fades in on play and out on pause, softens or pauses during breaks, and can start automatically with a focus session. Unavailable stations are skipped automatically.
- **Soundscape mixer** — Rain, waves, wind, fireplace, brown & white noise, generated live with the Web Audio API (no audio files), with presets like *Rainy night* and *Cozy cabin*.
- **Study board** — To do / In progress / Done with drag & drop, subjects, priorities and pomodoro estimates. Pick a task to focus on and finished sessions are credited to it.
- **Progress** — Daily goal ring, day streaks, XP & levels, 7-day chart, 18-week consistency heatmap and 14 achievements.
- **Zen mode** — Full-screen, distraction-free timer with music controls.
- **Brain dump** — An autosaving scratchpad for stray thoughts.
- **Scenes** — Aurora, Sunset, Ocean, Forest, Midnight and Sakura colour themes.
- **Keyboard shortcuts** — `Space` start/pause · `R` reset · `S` skip · `1 2 3` modes · `M` music · `N` next station · `Z` zen · `?` help.

Everything is stored locally in the browser — no account or API keys needed.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Radix UI / shadcn · YouTube IFrame Player API · Web Audio API

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Project structure

```
src/
├── app/                 # layout, global styles, page entry
├── components/flow/     # all app UI (timer, music, mixer, board, stats, zen…)
├── components/ui/       # shadcn primitives
├── contexts/            # settings, stats, tasks, timer, music, ambient, UI state
└── lib/                 # storage, youtube loader, ambient audio engine, content
```

## License

MIT — see [LICENSE](LICENSE).
