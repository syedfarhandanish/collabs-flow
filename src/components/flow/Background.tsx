"use client";

import { memo, useMemo } from "react";
import { useTimer } from "@/contexts/TimerContext";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const Stars = memo(function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() < 0.85 ? 1 : 2,
        delay: Math.random() * 6,
        dur: 3 + Math.random() * 5,
        key: i,
      })),
    []
  );
  return (
    <>
      {stars.map((s) => (
        <span
          key={s.key}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
});

export function Background() {
  const { mode, running } = useTimer();
  const resting = mode !== "focus";
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07070c]" aria-hidden>
      <div
        className="aurora-blob left-[-10%] top-[-15%] h-[55vmax] w-[55vmax]"
        style={{
          backgroundColor: resting ? "rgb(var(--rest))" : "rgb(var(--c1))",
          animation: "drift-a 28s ease-in-out infinite",
          opacity: running ? 0.6 : 0.45,
        }}
      />
      <div
        className="aurora-blob right-[-15%] top-[10%] h-[45vmax] w-[45vmax]"
        style={{ backgroundColor: "rgb(var(--c2))", animation: "drift-b 34s ease-in-out infinite", opacity: 0.35 }}
      />
      <div
        className="aurora-blob bottom-[-20%] left-[25%] h-[50vmax] w-[50vmax]"
        style={{ backgroundColor: "rgb(var(--c3))", animation: "drift-c 40s ease-in-out infinite", opacity: 0.3 }}
      />
      <Stars />
      {/* dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(7,7,12,0.55)_60%,#07070c_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: NOISE }} />
    </div>
  );
}
