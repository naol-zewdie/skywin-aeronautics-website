"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"visible" | "fadeout" | "done">("visible");

  useEffect(() => {
    // Start fade-out after DOM is ready
    const timer = setTimeout(() => setPhase("fadeout"), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === "fadeout") {
      const timer = setTimeout(() => setPhase("done"), 950);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`loading-screen ${phase === "fadeout" ? "fade-out" : ""}`}
      aria-hidden="true"
    >
      {/* Animated wireframe rings */}
      <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
        {/* Outer ring */}
        <div
          className="absolute rounded-full border-2 border-[#45576D]/50"
          style={{ width: 100, height: 100, animation: "spin 2.4s linear infinite" }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full border border-[#6a7e98]/40"
          style={{
            width: 68,
            height: 68,
            animation: "spin 1.6s linear infinite reverse",
          }}
        />
        {/* Inner glowing dot */}
        <div
          className="absolute rounded-full bg-[#45576D]"
          style={{
            width: 12,
            height: 12,
            boxShadow: "0 0 20px 6px rgba(69,87,109,0.7)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
        {/* Orbit dot */}
        <div
          className="absolute"
          style={{ width: 100, height: 100, animation: "spin 2.4s linear infinite" }}
        >
          <div
            className="absolute rounded-full bg-white"
            style={{ width: 6, height: 6, top: -3, left: "calc(50% - 3px)", boxShadow: "0 0 8px 2px rgba(255,255,255,0.8)" }}
          />
        </div>
      </div>

      {/* Brand name */}
      <div className="mt-8 text-center">
        <p
          className="text-white/90 text-lg tracking-[0.35em] uppercase font-medium"
          style={{ fontFamily: "var(--font-header)" }}
        >
          Skywin Aeronautics
        </p>
        <p className="text-white/40 text-xs tracking-widest mt-1 uppercase">
          Precision Aerospace Engineering
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
