import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "../../../lib/api";
import ServicesCTA from "../../components/ServicesCTA";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Skywin Aeronautics",
    };
  }

  return {
    title: `${service.title} | Skywin Aeronautics`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden pt-28 sm:pt-36 pb-24">
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

      {/* ── Ambient Radial Color Glows (Theme Palette) ── */}
      <div
        className="absolute -top-32 left-1/3 w-[700px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
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

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-12 sm:space-y-16">
        {/* ── Back Navigation Button ── */}
        <div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/[0.03] transition-all duration-200"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>BACK TO SERVICES</span>
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════
            SERVICE DETAIL VIEW (matching Image 3)
        ══════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left Column: "What is [service title]?" + Detailed Body */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-[#6a7e98] font-mono"
              >
                [ {service.category || "AEROSPACE CAPABILITY"} ]
              </span>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What is {service.title}?
              </h1>
            </div>

            {/* Parsed Description Text */}
            <div
              className="text-sm sm:text-base leading-relaxed text-white/70 space-y-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <p>{service.description}</p>
            </div>

            {/* Key Capability Attributes */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div
                className="p-3.5 rounded-xl border border-white/10"
                style={{ background: "rgba(13, 20, 34, 0.6)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  DEPLOYMENT
                </p>
                <p
                  className="text-xs sm:text-sm font-semibold text-white mt-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Mission-Certified
                </p>
              </div>

              <div
                className="p-3.5 rounded-xl border border-white/10"
                style={{ background: "rgba(13, 20, 34, 0.6)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ENGINEERING
                </p>
                <p
                  className="text-xs sm:text-sm font-semibold text-white mt-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  100% Sovereign Support
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-3">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-mono font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #23364F 0%, #45576D 100%)",
                  border: "1px solid rgba(106, 126, 152, 0.40)",
                  boxShadow: "0 0 24px rgba(69, 87, 109, 0.45)",
                }}
              >
                <span>REQUEST THIS SERVICE</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: High-tech Visual Card Container */}
          <div
            className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              background: "rgba(11, 17, 28, 0.85)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px rgba(69,87,109,0.15)",
            }}
          >
            {/* Telemetry Header */}
            <div className="flex items-center justify-between pb-3 px-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <span>SKYWIN AERONAUTICS CAPABILITY</span>
              <span className="text-[#6a7e98] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>

            {/* Image Container */}
            <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
              <Image
                src={service.image || "/drone.jpg"}
                alt={service.title}
                fill
                priority
                className="object-cover brightness-95"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* HUD corner accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#6a7e98]/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#6a7e98]/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#6a7e98]/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#6a7e98]/60 pointer-events-none" />

              {/* Subtle gradient vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, transparent 50%, rgba(5,10,18,0.5) 100%)",
                }}
              />
            </div>

            {/* Telemetry Footer */}
            <div className="pt-3 px-1 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>COORDINATES: ADDIS ABABA</span>
              <span>PROTOCOL: UAV-AERO-01</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            BOTTOM ROUTING TO CONTACT (matching Image 4)
        ══════════════════════════════════════════════════════ */}
        <ServicesCTA
          headline="Ready for aerospace solutions that work as hard as you do?"
          subtitle="Tell us about your operational objectives and what your mission requires. We'll come back with technical specifications, payload architecture, and a costed plan — sovereign engineering from day one."
          buttonText="GET IN TOUCH"
          href="/contact"
        />
      </div>
    </main>
  );
}
