"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
}

function sceneColors() {
  const s = getComputedStyle(document.documentElement);
  return ["--c1", "--c2", "--c3"].map((v) => `rgb(${s.getPropertyValue(v).trim().replace(/ /g, ",")})`).concat("#ffffff", "#fde68a");
}

/** Lightweight canvas confetti fired on `cf:celebrate` events. */
export function Confetti() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let particles: Particle[] = [];
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      el.width = window.innerWidth * devicePixelRatio;
      el.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
      for (const p of particles) {
        p.vy += 0.18;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (particles.length) raf = requestAnimationFrame(loop);
      else raf = 0;
    };

    const fire = (e: Event) => {
      if (reduce) return;
      const big = (e as CustomEvent).detail === "session";
      const colors = sceneColors();
      const count = big ? 160 : 60;
      const origins = big
        ? [
            { x: window.innerWidth * 0.2, y: window.innerHeight * 0.9, dir: 1 },
            { x: window.innerWidth * 0.8, y: window.innerHeight * 0.9, dir: -1 },
          ]
        : [{ x: window.innerWidth / 2, y: window.innerHeight * 0.75, dir: 0 }];
      for (const o of origins) {
        for (let i = 0; i < count / origins.length; i++) {
          const angle = o.dir === 0 ? -Math.PI / 2 + (Math.random() - 0.5) * 1.4 : -Math.PI / 2 + o.dir * (0.2 + Math.random() * 0.6);
          const speed = 8 + Math.random() * (big ? 10 : 6);
          particles.push({
            x: o.x,
            y: o.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 120 + Math.random() * 60,
          });
        }
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("cf:celebrate", fire);
    return () => {
      window.removeEventListener("cf:celebrate", fire);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden />;
}
