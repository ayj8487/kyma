"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "light" | "dark";

/**
 * Background canvas effects for the home page.
 * - Light mode: cherry blossom petals drifting from top to bottom
 * - Dark mode: occasional fireworks bursting at random positions
 *
 * Respects prefers-reduced-motion. Pointer-events: none — never blocks clicks.
 */
export function SeasonalEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  // Watch for theme changes via the `dark` class on <html>
  useEffect(() => {
    const detect = () =>
      setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
    detect();
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!mode) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    const stop = mode === "light" ? startSakura(ctx) : startFireworks(ctx);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🌸 Cherry blossom (light mode)
// ═══════════════════════════════════════════════════════════════════

interface Petal {
  x: number;
  y: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  alpha: number;
  color: string;
}

const PETAL_COLORS = [
  "rgba(252, 231, 243, 0.9)", // pink-100
  "rgba(251, 207, 232, 0.85)", // pink-200
  "rgba(249, 168, 212, 0.8)", // pink-300
  "rgba(244, 114, 182, 0.7)", // pink-400
  "rgba(255, 230, 240, 0.85)", // soft pink
];

function createPetal(initialY: number): Petal {
  const w = window.innerWidth;
  return {
    x: Math.random() * w,
    y: initialY,
    vy: 0.5 + Math.random() * 1.2,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.02,
    swayAmp: 0.5 + Math.random() * 1.2,
    alpha: 0.55 + Math.random() * 0.45,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;

  // 5-lobed sakura petal silhouette using overlapping ellipses
  const r = p.size;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const cx = Math.cos(angle) * r * 0.45;
    const cy = Math.sin(angle) * r * 0.45;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.42, r * 0.55, angle + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function startSakura(ctx: CanvasRenderingContext2D): () => void {
  // Density adapts to viewport; 1 petal per ~14k px²
  const area = window.innerWidth * window.innerHeight;
  const count = Math.min(60, Math.max(20, Math.floor(area / 14000)));
  const petals: Petal[] = [];
  for (let i = 0; i < count; i++) {
    petals.push(createPetal(Math.random() * window.innerHeight - window.innerHeight));
  }

  let running = true;
  let id = 0;
  const tick = () => {
    if (!running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (const p of petals) {
      p.swayPhase += p.swaySpeed;
      p.x += Math.sin(p.swayPhase) * p.swayAmp;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.y > h + 30) {
        // Recycle from top
        p.y = -30;
        p.x = Math.random() * w;
      }
      if (p.x < -30) p.x = w + 20;
      if (p.x > w + 30) p.x = -20;

      drawPetal(ctx, p);
    }
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => {
    running = false;
    cancelAnimationFrame(id);
  };
}

// ═══════════════════════════════════════════════════════════════════
// 🎆 Fireworks (dark mode)
// ═══════════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1.0 → 0
  decay: number;
  color: string;
  size: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

const FIREWORK_PALETTES: string[][] = [
  ["#ff6b9d", "#ffc1cc", "#ffe0e9"], // pink
  ["#a78bfa", "#c4b5fd", "#ddd6fe"], // violet
  ["#fbbf24", "#fde68a", "#fef3c7"], // gold
  ["#34d399", "#86efac", "#bbf7d0"], // green
  ["#60a5fa", "#93c5fd", "#bfdbfe"], // blue
  ["#f472b6", "#f9a8d4", "#fbcfe8"], // rose
  ["#fb7185", "#fda4af", "#fecdd3"], // red
];

function startFireworks(ctx: CanvasRenderingContext2D): () => void {
  const rockets: Rocket[] = [];
  const particles: Particle[] = [];
  let nextLaunchAt = performance.now() + 600;
  let running = true;

  const launch = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const palette = FIREWORK_PALETTES[Math.floor(Math.random() * FIREWORK_PALETTES.length)];
    rockets.push({
      x: w * (0.15 + Math.random() * 0.7),
      y: h + 10,
      vy: -(7 + Math.random() * 4),
      targetY: h * (0.18 + Math.random() * 0.3),
      color: palette[0],
      trail: [],
    });
  };

  const explode = (rocket: Rocket) => {
    const palette = FIREWORK_PALETTES.find((p) => p[0] === rocket.color) ?? FIREWORK_PALETTES[0];
    const count = 50 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 1.5 + Math.random() * 4.5;
      particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 1.5 + Math.random() * 1.5,
        trail: [],
      });
    }
  };

  let id = 0;
  const tick = () => {
    if (!running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Erase previous frame quickly so rocket trail fades fast.
    // destination-out actually subtracts alpha (true clearing) instead of
    // layering a dark color, so trails don't accumulate visible residue.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    // Schedule next rocket
    const now = performance.now();
    if (now > nextLaunchAt) {
      launch();
      nextLaunchAt = now + 800 + Math.random() * 1800;
    }

    // Rockets (rising)
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.trail.push({ x: r.x, y: r.y, alpha: 1 });
      if (r.trail.length > 4) r.trail.shift(); // shorter visible trail
      r.y += r.vy;
      r.vy += 0.08; // gravity slowing rise

      // Draw trail (smaller + fainter)
      for (let t = 0; t < r.trail.length; t++) {
        const tr = r.trail[t];
        const a = (t / r.trail.length) * 0.35;
        ctx.globalAlpha = a;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      // Head with light glow
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 6;
      ctx.shadowColor = r.color;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (r.y <= r.targetY || r.vy >= 0) {
        explode(r);
        rockets.splice(i, 1);
      }
    }

    // Particles (after explosion)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.vx *= 0.99; // air drag
      p.vy *= 0.99;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > h + 20) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => {
    running = false;
    cancelAnimationFrame(id);
  };
}
