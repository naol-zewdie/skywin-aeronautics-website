export const revalidate = 0;

import { Suspense } from "react";
import { getProducts } from "../../lib/api";
import { ProductsScene } from "../components/ClientComponents";
import ProductsExplorer from "../components/ProductsExplorer";
import ServicesCTA from "../components/ServicesCTA";

export const metadata = {
  title: "Skywin Aeronautics | Products & UAV Platforms",
  description:
    "Explore Skywin Aeronautics sovereign UAV fleet, tactical FPV systems, surveillance drones, heavy-lift quadcopters, and long-range VTOL aircraft.",
};

async function ProductsContent() {
  const products = await getProducts();

  return (
    <div className="space-y-16">
      {/* ── Products Presentation Grid & Filter (matching Services/Image 2) ── */}
      <ProductsExplorer products={products} />
    </div>
  );
}

function ProductsSkeleton() {
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

export default async function ProductsPage() {
  const products = await getProducts();
  const countWord =
    products.length === 4
      ? "Four"
      : products.length === 6
      ? "Six"
      : products.length === 8
      ? "Eight"
      : products.length > 0
      ? `${products.length}`
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
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.15) 60%, transparent 100%)",
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

      {/* ── Three.js Orbital Atom Scene in Hero Background ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none opacity-35 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <ProductsScene />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-16 sm:space-y-20">
        {/* ══════════════════════════════════════════════════════
            1. HEADLINE PART (matching Services/Image 1 style)
        ══════════════════════════════════════════════════════ */}
        <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
          {/* Top tag */}
          <div className="mb-6">
            <span
              className="text-[11px] uppercase tracking-[0.22em] text-[#6a7e98] font-mono"
            >
              WHAT WE BUILD · UAV FLEET &amp; AEROSPACE PLATFORMS
            </span>
          </div>

          {/* Clean balanced display headline */}
          <h1
            className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {countWord} platforms. One
            <br />
            operating standard.
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 sm:mt-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-white/60"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            Every aerial vehicle is precision-engineered for sovereign defense,
            tactical reconnaissance, and critical enterprise operations. Designed,
            assembled, and flight-tested entirely in-house.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════
            2. PRODUCTS PRESENTATION GRID & FILTERS (matching Services/Image 2)
        ══════════════════════════════════════════════════════ */}
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsContent />
        </Suspense>

        {/* ══════════════════════════════════════════════════════
            3. BOTTOM ROUTING TO CONTACT (matching Image 4)
        ══════════════════════════════════════════════════════ */}
        <ServicesCTA
          headline="Ready to deploy aerospace platforms engineered for your mission?"
          subtitle="Tell us about your mission requirements, payload parameters, and operational specs. We'll come back with technical architecture, payload options, and a costed deployment plan."
          buttonText="REQUEST SPECIFICATIONS"
          href="/contact"
        />
      </div>
    </main>
  );
}
