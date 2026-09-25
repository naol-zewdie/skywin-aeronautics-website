"use client";

import { useEffect, useRef, useCallback } from "react";

interface TrailParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; radius: number; hue: number;
}

interface Ripple {
  x: number; y: number; age: number; duration: number; rings: number;
}

const TRAIL_SPAWN_INTERVAL = 0.022;
const TRAIL_MAX_LIFE       = 1.1;
const TRAIL_MAX_PARTICLES  = 180;
const RIPPLE_DURATION      = 1.4;
const RIPPLE_MAX_RADIUS    = 160;
const RIPPLE_RINGS         = 3;
const TRAIL_HUES           = [210, 218, 225, 215, 220];

export default function HeroInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    particles: [] as TrailParticle[],
    ripples:   [] as Ripple[],
    mouse:     { x: -999, y: -999, active: false },
    lastSpawn: 0, lastTime: 0, raf: 0,
  });

  const resize = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const parent = canvas.parentElement; if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    canvas.width  = width  * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width  = width  + "px";
    canvas.style.height = height + "px";
  }, []);

  const tick = useCallback((timestamp: number) => {
    const s = stateRef.current;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dt  = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;
    const dpr = window.devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn trail particle
    if (s.mouse.active) {
      s.lastSpawn += dt;
      if (s.lastSpawn >= TRAIL_SPAWN_INTERVAL && s.particles.length < TRAIL_MAX_PARTICLES) {
        s.lastSpawn = 0;
        const hue   = TRAIL_HUES[Math.floor(Math.random() * TRAIL_HUES.length)];
        const speed = 0.4 + Math.random() * 0.6;
        const angle = Math.random() * Math.PI * 2;
        s.particles.push({
          x: s.mouse.x * dpr, y: s.mouse.y * dpr,
          vx: Math.cos(angle) * speed * dpr,
          vy: (Math.sin(angle) * speed - 0.6) * dpr,
          life: 1,
          maxLife: TRAIL_MAX_LIFE * (0.7 + Math.random() * 0.6),
          radius:  (1.2 + Math.random() * 2.2) * dpr, hue,
        });
      }
    }

    // Update + draw particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life -= dt / p.maxLife;
      if (p.life <= 0) { s.particles.splice(i, 1); continue; }
      p.vy -= 0.015 * dpr * dt * 60;
      p.vx *= 1 - 0.06 * dt * 60;
      p.vy *= 1 - 0.04 * dt * 60;
      p.x  += p.vx; p.y += p.vy;
      const alpha  = p.life * p.life * 0.82;
      const radius = p.radius * (0.5 + p.life * 0.5);
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.5);
      glow.addColorStop(0, "hsla(" + p.hue + ",72%,62%," + (alpha * 0.55) + ")");
      glow.addColorStop(1, "hsla(" + p.hue + ",72%,62%,0)");
      ctx.beginPath(); ctx.arc(p.x, p.y, radius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + p.hue + ",80%,78%," + alpha + ")"; ctx.fill();
    }

    // Update + draw ripples
    for (let i = s.ripples.length - 1; i >= 0; i--) {
      const r = s.ripples[i];
      r.age += dt;
      if (r.age >= r.duration) { s.ripples.splice(i, 1); continue; }
      const progress = r.age / r.duration;
      const ease     = 1 - Math.pow(1 - progress, 3);
      for (let ring = 0; ring < r.rings; ring++) {
        const off  = ring / r.rings;
        const rp   = Math.max(0, ease - off * 0.28);
        if (rp <= 0) continue;
        const rr   = rp * RIPPLE_MAX_RADIUS * dpr;
        const ra   = (1 - rp) * (1 - off * 0.5) * 0.75;
        ctx.beginPath(); ctx.arc(r.x * dpr, r.y * dpr, rr, 0, Math.PI * 2);
        ctx.strokeStyle = "hsla(215,72%,65%," + ra + ")";
        ctx.lineWidth = (1.5 - off * 0.5) * dpr; ctx.stroke();
      }
      if (progress < 0.15) {
        const fa = (1 - progress / 0.15) * 0.5;
        const fg = ctx.createRadialGradient(r.x*dpr,r.y*dpr,0,r.x*dpr,r.y*dpr,24*dpr);
        fg.addColorStop(0, "hsla(220,90%,80%," + fa + ")");
        fg.addColorStop(1, "hsla(220,90%,80%,0)");
        ctx.beginPath(); ctx.arc(r.x*dpr, r.y*dpr, 24*dpr, 0, Math.PI*2);
        ctx.fillStyle = fg; ctx.fill();
      }
    }
    s.raf = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    resize();
    const ro     = new ResizeObserver(resize);
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);
    window.addEventListener("resize", resize, { passive: true });
    const onMove  = (e: MouseEvent) => {
      const c = canvasRef.current; if (!c) return;
      const rect = c.getBoundingClientRect();
      s.mouse.x = e.clientX - rect.left;
      s.mouse.y = e.clientY - rect.top;
      s.mouse.active = true;
    };
    const onLeave = () => { s.mouse.active = false; };
    const onEnter = () => { s.mouse.active = true;  };
    const onClick = (e: MouseEvent) => {
      const c = canvasRef.current; if (!c) return;
      const rect = c.getBoundingClientRect();
      s.ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top,
        age: 0, duration: RIPPLE_DURATION, rings: RIPPLE_RINGS });
    };
    const t = parent ?? document.documentElement;
    t.addEventListener("mousemove",  onMove  as EventListener, { passive: true });
    t.addEventListener("mouseleave", onLeave as EventListener);
    t.addEventListener("mouseenter", onEnter as EventListener);
    t.addEventListener("click",      onClick as EventListener);
    s.lastTime = performance.now();
    s.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(s.raf);
      t.removeEventListener("mousemove",  onMove  as EventListener);
      t.removeEventListener("mouseleave", onLeave as EventListener);
      t.removeEventListener("mouseenter", onEnter as EventListener);
      t.removeEventListener("click",      onClick as EventListener);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, [tick, resize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}