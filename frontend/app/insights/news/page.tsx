export const revalidate = 60;

import { Suspense } from "react";
import { getPostsByType } from "../../../lib/api";
import { ContentType } from "../../../lib/types";
import { InsightsScene } from "../../components/ClientComponents";
import InsightsExplorer from "../../components/InsightsExplorer";

export const metadata = {
  title: "Skywin Aeronautics | News & Press Releases",
  description:
    "Official bulletins, factory milestones, national aerospace partnerships, and fleet testing deployments from Skywin Aeronautics.",
};

async function NewsContent() {
  const posts = await getPostsByType(ContentType.NEWS);
  return (
    <InsightsExplorer
      posts={posts}
      fixedType={ContentType.NEWS}
      filterLabel="BROWSE NEWS TOPICS"
    />
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-white/[0.04] rounded-lg" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default async function NewsPage() {
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

      {/* ── Ambient Radial Color Glows ── */}
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

      {/* ── Three.js Hero Telemetry Scene ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[620px] pointer-events-none opacity-35 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <InsightsScene />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-16 sm:space-y-20">
        {/* ══════════════════════════════════════════════════════
            1. HEADLINE PART (Matching Reference Image 1)
        ══════════════════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
          {/* Top Tag */}
          <div className="mb-6">
            <span
              className="text-[11px] uppercase tracking-[0.22em] text-[#6a7e98] font-mono"
            >
              [ NEWS &amp; MEDIA · AEROSPACE DISPATCHES ]
            </span>
          </div>

          {/* Clean balanced display headline */}
          <h1
            className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dispatches from the
            <br />
            front line.
          </h1>

          {/* Monospace Subtitle matching Image 1 */}
          <p
            className="mt-6 sm:mt-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-white/60"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            Official bulletins, manufacturing hangar readiness, sovereign defense
            initiatives, and aerospace development announcements direct from Skywin
            Aeronautics in Addis Ababa.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════
            2. EXPLORER GRID & ARCHIVE (Matching Image 2)
        ══════════════════════════════════════════════════════ */}
        <Suspense fallback={<NewsSkeleton />}>
          <NewsContent />
        </Suspense>
      </div>
    </main>
  );
}
