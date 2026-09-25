export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareerBySlug } from "../../../lib/api";

interface CareerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CareerPageProps) {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);

  if (!career) {
    return {
      title: "Position Not Found | Skywin Aeronautics",
    };
  }

  return {
    title: `${career.title} | Skywin Aeronautics Careers`,
    description: career.description.slice(0, 160),
  };
}

export default async function CareerDetailPage({ params }: CareerPageProps) {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);

  if (!career) {
    notFound();
  }

  const displayImage = career.image || "/drone.jpg";
  const roleType = (career.type || "full-time").toUpperCase();
  const locationStr = career.location || "Addis Ababa, Ethiopia";

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

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-10 sm:space-y-12">
        {/* ══════════════════════════════════════════════════════
            1. BREADCRUMBS & NAVIGATION (Matching Reference Image 3 Top)
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/careers"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/[0.03] transition-all duration-200 self-start"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>BACK TO CAREERS</span>
          </Link>

          <div className="text-[11px] font-mono tracking-widest text-white/40 uppercase overflow-hidden text-ellipsis whitespace-nowrap">
            <span>CAREERS</span>
            <span className="mx-2 text-white/20">•</span>
            <span>{roleType}</span>
            <span className="mx-2 text-white/20">•</span>
            <span className="text-white/60">{career.title}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. HERO CARD CONTAINER (Matching Reference Image 3)
        ══════════════════════════════════════════════════════ */}
        <section
          className="relative rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-10 md:p-12 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between"
          style={{
            background: "rgba(11, 17, 28, 0.88)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 20px 60px -10px rgba(0,0,0,0.8), 0 0 30px rgba(69,87,109,0.15)",
          }}
        >
          {/* Background Blueprint / Graphic Overlay */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
            <Image
              src={displayImage}
              alt={career.title}
              fill
              priority
              className="object-cover object-center filter grayscale contrast-125"
            />
            {/* Cyan/Slate schematic gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 75% 40%, rgba(56, 189, 248, 0.15) 0%, rgba(14, 23, 42, 0.85) 60%, rgba(11, 17, 28, 0.98) 100%)",
              }}
            />
            <div className="absolute inset-0 tech-grid opacity-25" />
          </div>

          {/* Top Row: Pill Tag + Status */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white uppercase tracking-wider">
                {roleType}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/60 tracking-wider">
                {locationStr.toUpperCase()}
              </span>
            </div>

            <div className="text-white/50 tracking-widest uppercase text-[11px]">
              <span>ACTIVE OPENING</span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white/80 font-semibold">
                SKYWIN AERONAUTICS
              </span>
            </div>
          </div>

          {/* Massive Display Title (Matching Image 3 Headline Style) */}
          <div className="relative z-10 my-8 sm:my-12 max-w-4xl">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.06] tracking-tight drop-shadow-md"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {career.title}
            </h1>
          </div>

          {/* Floating Excerpt Callout Box (Matching Image 3 Bottom Right Card) */}
          <div className="relative z-10 flex justify-end">
            <div
              className="w-full sm:max-w-lg rounded-2xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-3"
              style={{
                background: "rgba(7, 13, 24, 0.92)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#6a7e98] uppercase tracking-widest">
                <span>[ POSITION BRIEF ]</span>
                <span className="text-emerald-400">IMMEDIATE OPENING</span>
              </div>

              <p className="text-xs sm:text-[13px] leading-relaxed text-white/80 font-mono">
                {career.description}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#6a7e98]">
                <span>📍 {locationStr}</span>
                <span>⏱️ {roleType}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            3. ROLE DETAILS & APPLICATION SECTION (Matching Image 4)
        ══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto pt-6 pb-12 space-y-12">
          {/* Main Description */}
          <article className="text-sm sm:text-base leading-relaxed text-white/75 space-y-8 font-mono sm:font-sans">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Role Overview
              </h2>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {career.description}
              </p>
            </div>

            {/* Candidate Requirements */}
            {career.requirements && career.requirements.length > 0 && (
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Candidate Profile &amp; Qualifications
                </h3>
                <ul className="space-y-3 list-none pl-0">
                  {career.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]"
                    >
                      <span className="text-sky-400 font-bold">✓</span>
                      <span className="text-white/80 text-xs sm:text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Operating Environment */}
            <div>
              <h3
                className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Working at Skywin Hangars
              </h3>
              <p className="text-white/70 leading-relaxed">
                As part of our sovereign aerospace engineering team in Addis Ababa,
                you will collaborate directly with aerodynamicists, avionics
                architects, and structural composite engineers. We build production
                unmanned aerial platforms from scratch, giving you hands-on ownership
                from design sketches to live flight tests in certified national airspace.
              </p>
            </div>
          </article>

          {/* Direct Application CTA Button */}
          <div
            className="p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            style={{
              background: "rgba(11, 17, 28, 0.85)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.7)",
            }}
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6a7e98]">
                READY TO APPLY?
              </span>
              <h3
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Join the Skywin Engineering Team
              </h3>
              <p className="text-xs font-mono text-white/50">
                Submit your CV and engineering portfolio for priority review.
              </p>
            </div>

            <Link
              href={`/contact?role=${encodeURIComponent(career.title)}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-mono font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 hover:scale-105 whitespace-nowrap self-start sm:self-auto"
              style={{
                background:
                  "linear-gradient(135deg, #23364F 0%, #45576D 100%)",
                border: "1px solid rgba(106, 126, 152, 0.40)",
                boxShadow: "0 0 24px rgba(69, 87, 109, 0.45)",
              }}
            >
              <span>APPLY FOR THIS ROLE</span>
              <span>→</span>
            </Link>
          </div>

          {/* Author Signature & Dispatch Metadata */}
          <div
            className="p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            style={{
              background: "rgba(11, 17, 28, 0.7)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#6a7e98]">
                RECRUITMENT DISPATCH
              </p>
              <p
                className="text-base sm:text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Skywin Aeronautics Talent &amp; Engineering Operations
              </p>
              <p className="text-xs font-mono text-white/40">
                Addis Ababa, Ethiopia · Sovereign Aerospace Manufacturing
              </p>
            </div>

            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-white border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/10 transition-all duration-200 self-start sm:self-auto cursor-pointer"
            >
              <span>← BACK TO CAREERS</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
