"use client";

import { memo, useId } from "react";

interface Props {
  progress: number;
  size: number;
  stroke?: number;
  resting?: boolean;
  ticks?: boolean;
  glow?: boolean;
}

export const TimerRing = memo(function TimerRing({ progress, size, stroke = 10, resting, ticks, glow }: Props) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2 - (ticks ? 14 : 0);
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const center = size / 2;
  const tickCount = 60;
  const lit = Math.round(p * tickCount);
  const angle = p * 2 * Math.PI - Math.PI / 2;
  const dotX = center + r * Math.cos(angle);
  const dotY = center + r * Math.sin(angle);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={resting ? "rgb(var(--rest))" : "rgb(var(--c1))"} />
          <stop offset="100%" stopColor="rgb(var(--c2))" />
        </linearGradient>
        <filter id={`f-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {ticks &&
        Array.from({ length: tickCount }, (_, i) => {
          const a = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
          const major = i % 5 === 0;
          const r1 = size / 2 - 2;
          const r2 = r1 - (major ? 8 : 4);
          return (
            <line
              key={i}
              x1={center + r1 * Math.cos(a)}
              y1={center + r1 * Math.sin(a)}
              x2={center + r2 * Math.cos(a)}
              y2={center + r2 * Math.sin(a)}
              stroke={i < lit ? `url(#g-${id})` : "rgba(255,255,255,0.12)"}
              strokeWidth={major ? 2 : 1.25}
              strokeLinecap="round"
              style={{ transition: "stroke 0.4s ease" }}
            />
          );
        })}

      <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      {glow && (
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={`url(#g-${id})`}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          filter={`url(#f-${id})`}
          opacity={0.7}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      )}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={`url(#g-${id})`}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      {p > 0.002 && (
        <circle
          cx={dotX}
          cy={dotY}
          r={stroke * 0.75}
          fill="white"
          style={{ transition: "cx 0.6s ease, cy 0.6s ease", filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}
        />
      )}
    </svg>
  );
});
