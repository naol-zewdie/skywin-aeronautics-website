"use client";

// Horizontal auto-scrolling marquee with Skywin stats
// Matches the ticker/marquee strips on premium agency sites
const items = [
  "UAV Platforms",
  "Est. 2025",
  "7+ Services",
  "100% Indigenous Engineering",
  "Addis Ababa",
  "Precision Aerospace",
  "UAV Platforms",
  "Est. 2025",
  "7+ Services",
  "100% Indigenous Engineering",
  "Addis Ababa",
  "Precision Aerospace",
];

export default function StatsTicker() {
  return (
    <div
      className="relative overflow-hidden border-y py-3"
      style={{ borderColor: "rgba(56,189,248,0.12)" }}
    >
      {/* Left & right fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #000 0%, transparent 100%)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, #000 0%, transparent 100%)" }} />

      {/* Scrolling track — duplicate for seamless loop */}
      <div className="flex gap-0 animate-ticker whitespace-nowrap w-max">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-6"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              color: "rgba(240,244,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            {item}
            {/* Diamond separator */}
            <span style={{ color: "#38bdf8", fontSize: "8px" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
