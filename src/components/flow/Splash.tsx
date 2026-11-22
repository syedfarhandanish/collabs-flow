export function Splash() {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden" role="status" aria-label="Loading Collabs Flow">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/30 blur-[100px]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
        <p className="font-display text-2xl italic text-white/80">getting into flow…</p>
        <noscript>
          <p className="max-w-xs text-center text-sm text-white/60">Collabs Flow needs JavaScript enabled to run the timer and music.</p>
        </noscript>
      </div>
    </div>
  );
}
