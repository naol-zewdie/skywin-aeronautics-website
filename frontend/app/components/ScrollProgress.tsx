"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = document.documentElement;
          const scrolled = el.scrollTop;
          const total = el.scrollHeight - el.clientHeight;
          setPct(total > 0 ? Math.round((scrolled / total) * 100) : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3"
      aria-hidden="true"
    >
      {/* Track */}
      <div className="relative w-px h-28 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full scroll-bar-gradient rounded-full transition-all duration-150"
          style={{ height: `${pct}%` }}
        />
      </div>
      {/* Glowing dot */}
      <div
        className="w-1.5 h-1.5 rounded-full breathe-glow"
        style={{ background: '#45576D', boxShadow: '0 0 6px 2px rgba(59,130,246,0.6)' }}
      />
      {/* Percentage */}
      <span
        style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.05em' }}
        className="text-white/30 tabular-nums"
      >
        {String(pct).padStart(3, "0")}%
      </span>
    </div>
  );
}

