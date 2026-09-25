export const revalidate = 0;

import { Suspense } from "react";
import { getServices } from "../../lib/api";
import { ServicesScene } from "../components/ClientComponents";
import ServicesExplorer from "../components/ServicesExplorer";
import ServicesCTA from "../components/ServicesCTA";

export const metadata = {
  title: "Skywin Aeronautics | Services",
  description:
    "Explore Skywin Aeronautics sovereign UAV engineering, aerial surveying, flight simulation training, and defense mission services.",
};

async function ServicesContent() {
  const services = await getServices();

  return (
    <div className="space-y-16">
      {/* ── Services Presentation Grid & Filter (matching Image 2) ── */}
      <ServicesExplorer services={services} />
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Filter Skeleton */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-full bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-[#0d1424]/60 overflow-hidden animate-pulse"
          >
            <div className="aspect-[16/11] bg-white/[0.04]" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
              <div className="h-3 w-full bg-white/[0.03] rounded" />
              <div className="h-3 w-5/6 bg-white/[0.03] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  const countWord =
    services.length === 7
      ? "Seven"
      : services.length === 16
      ? "Sixteen"
      : services.length > 0
      ? `${services.length}`
      : "Core";

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
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.20) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -left-40 w-[600px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-15 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.35) 0%, rgba(35, 54, 79, 0.2) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Three.js Radar Sweep Scene in Hero Background ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none opacity-35 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <ServicesScene />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-16 sm:space-y-20">
        {/* ══════════════════════════════════════════════════════
            1. HEADLINE PART (matching Image 1)
        ══════════════════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
          {/* Top tag */}
          <div className="mb-6">
            <span
              className="text-[11px] uppercase tracking-[0.22em] text-[#6a7e98] font-mono"
            >
              WHAT WE DO · AEROSPACE &amp; UAV SYSTEMS
            </span>
          </div>

          {/* Clean bold display headline matching Image 1 without shadow text */}
          <h1
            className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comprehensive aerospace services built for growth.
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 sm:mt-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-white/60"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            Our service offerings are designed to support aerospace programs at every stage, from early concept through production and delivery.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════
            2. SERVICES PRESENTATION GRID & FILTERS (matching Image 2)
        ══════════════════════════════════════════════════════ */}
        <Suspense fallback={<ServicesSkeleton />}>
          <ServicesContent />
        </Suspense>

        {/* ══════════════════════════════════════════════════════
            4. BOTTOM ROUTING TO CONTACT (matching Image 4)
        ══════════════════════════════════════════════════════ */}
        <ServicesCTA
          headline="Ready for aerospace solutions that work as hard as you do?"
          subtitle="Tell us about your mission requirements and operational needs. We'll come back with technical specifications, payload options, and a costed plan — sovereign engineering from day one."
          buttonText="GET IN TOUCH"
          href="/contact"
        />
      </div>
    </main>
  );
}
