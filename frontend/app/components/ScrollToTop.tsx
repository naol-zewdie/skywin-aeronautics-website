"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 ring-2 ring-[color:var(--accent)]/20 ring-offset-4 ring-offset-[color:var(--background)] md:bottom-12 md:right-12"
      aria-label="Scroll to top"
      style={{ animation: "fade-in-up 0.4s ease-out both" }}
    >
      {/* Orbit dot */}
      <span className="pointer-events-none absolute inset-0 rounded-full" aria-hidden>
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 orbit-dot"
        />
      </span>
      <svg
        className="w-6 h-6 relative z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M5 10l7-7m0 0l7 7M12 3v18" />
      </svg>
    </button>
  );
}

