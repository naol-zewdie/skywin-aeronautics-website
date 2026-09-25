export const revalidate = 0;

import { Suspense } from "react";
import { getCareers } from "../../lib/api";
import { CareersScene } from "../components/ClientComponents";
import CareersExplorer from "../components/CareersExplorer";

export const metadata = {
  title: "Skywin Aeronautics | Careers & Engineering Talent",
  description:
    "Join Skywin Aeronautics sovereign UAV manufacturing initiative. Explore aerospace engineering, flight operations, composite structures, and avionics positions.",
};

async function CareersContent() {
  const careers = await getCareers();
  return <CareersExplorer careers={careers} />;
}

function CareersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-white/[0.04] rounded-lg" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-[#0d1424]/60 overflow-hidden"
          >
            <div className="aspect-[16/10] bg-white/[0.04]" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
              <div className="h-3 w-full bg-white/[0.03] rounded" />
              <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CareersPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden pt-24 sm:pt-32 pb-24">
      {/* ── Dot Matrix Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* ── Ambient Radial Color Glows (Theme Colors) ── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.15) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -right-40 w-[600px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-15 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.35) 0%, rgba(35, 54, 79, 0.2) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Three.js DNA Helix / Trajectory Scene ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[620px] pointer-events-none opacity-35 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <CareersScene />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-16 sm:space-y-20">
        {/* ══════════════════════════════════════════════════════
            1. HEADLINE PART (Matching Reference Image 1)
        ══════════════════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
          {/* Top Tag Pill */}
          <div className="mb-6">
            <span
              className="text-[11px] uppercase tracking-[0.22em] text-[#6a7e98] font-mono"
            >
              [ CAREERS &amp; TALENT · SOVEREIGN AEROSPACE ENGINEERING ]
            </span>
          </div>

          {/* Clean balanced display headline */}
          <h1
            className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Engineering the
            <br />
            unmanned future.
          </h1>

          {/* Monospace Subtitle matching Image 1 */}
          <p
            className="mt-6 sm:mt-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-white/60"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            We are looking for aerospace engineers, avionics developers, composite
            technicians, and certified UAV pilots ready to solve hard aerodynamic
            problems in our Addis Ababa hangars. No fluff, no hype.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════
            2. CAREERS EXPLORER GRID & ARCHIVE (Matching Image 2)
        ══════════════════════════════════════════════════════ */}
        <Suspense fallback={<CareersSkeleton />}>
          <CareersContent />
        </Suspense>

        {/* ══════════════════════════════════════════════════════
            3. CULTURE & VALUE PILLARS
        ══════════════════════════════════════════════════════ */}
        <section
          className="rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden"
          style={{
            background: "rgba(11, 17, 28, 0.75)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #45576D, transparent)",
            }}
          />

          <div className="space-y-4 mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#6a7e98]">
              [ CULTURE &amp; OPERATING PRINCIPLES ]
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why build at Skywin Aeronautics?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              {
                icon: "🚀",
                title: "National Mandate",
                desc: "Work on strategic, sovereign aerospace platforms that protect critical infrastructure and advance Ethiopian technology sovereignty.",
              },
              {
                icon: "⚡",
                title: "Full-Cycle Engineering",
                desc: "From composite autoclaves and aerodynamic wind tunnels to PCB integration and live flight-testing airspace.",
              },
              {
                icon: "🤝",
                title: "Accelerated Growth",
                desc: "Mentorship from senior aerospace pioneers, rapid prototyping cycles, and direct technical leadership opportunities.",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3"
              >
                <div className="text-2xl">{pillar.icon}</div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {pillar.title}
                </h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
