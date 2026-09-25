import Image from "next/image";
import { AboutScene } from "../components/ClientComponents";
import ScrollReveal from "../components/ScrollReveal";

export const metadata = {
  title: "Skywin Aeronautics | About",
  description:
    "Learn about Skywin Aeronautics Industry — our founding, national mandate, indigenous UAV manufacturing, and Vision 2030.",
};

const FAQS = [
  {
    q: "Is Skywin Aeronautics a state-mandated initiative?",
    a: "Yes. SkyWin Aeronautics Industry was inaugurated on March 8, 2025 by the Federal Democratic Republic of Ethiopia Prime Minister, H.E Abiy Ahmed (PhD), as a strategic national unmanned aerial systems manufacturing initiative. The company was established with a mandate to reduce external technology dependency while strengthening indigenous aerospace engineering capability.",
  },
  {
    q: "What does SkyWin Aeronautics Industry produce?",
    a: "SkyWin designs and manufactures sovereign unmanned aerial vehicles (UAVs), along with integrated subsystems including composite airframes, custom avionics integration, secure ground control interfaces, and mission-specific sensor payload configurations.",
  },
  {
    q: "What types of UAV systems does SkyWin develop?",
    a: "SkyWin develops multi-role tactical and commercial UAV platforms designed for operational flexibility — including reconnaissance, surveillance, critical infrastructure monitoring, agricultural aerial surveys, and specialized defense missions.",
  },
  {
    q: "Where is SkyWin Aeronautics based?",
    a: "Headquartered in Addis Ababa, Ethiopia, operating integrated aerospace manufacturing hangars, research and development laboratories, and formal testing and commissioning departments with dedicated flight-test airspace.",
  },
  {
    q: "What is included in Drone Piloting & Technical Training?",
    a: "Our training academy equips trainees with practical flight operations, flight control theory, safety procedures, system maintenance, and mission planning using certified UAV platforms and advanced simulation hardware.",
  },
  {
    q: "Do you offer technical consultancy & customized missions?",
    a: "Yes. SkyWin provides expert engineering consultancy in UAV platform selection, sensor payload integration, and operational strategy, as well as customized aerial mission execution for governmental and institutional partners.",
  },
];

export default function AboutPage() {
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

      {/* ── Ambient Radial Color Glows (Skywin Theme Colors) ── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.20) 60%, transparent 100%)",
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

      {/* ── Three.js Constellation Network Scene ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none opacity-35 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <AboutScene />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 space-y-24 sm:space-y-32">
        {/* ══════════════════════════════════════════════════════
            1. FIRST: THE HEADLINE PART (Image 1)
        ══════════════════════════════════════════════════════ */}
        <ScrollReveal direction="up" delay={50}>
          <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
            {/* Top pill badges */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] text-[#6a7e98] border border-[#6a7e98]/30 bg-[#6a7e98]/10"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ABOUT
              </span>
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] text-white/50 border border-white/10 bg-white/[0.03]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                EST. 2025 · ADDIS ABABA
              </span>
            </div>

            {/* Headline without shadow text and with decreased, balanced size */}
            <h1
              className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Leading African Aeronautics Innovation.
            </h1>

            {/* Subtitle */}
            <p
              className="mt-6 sm:mt-7 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-white/60"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.02em",
              }}
            >
              A strategic national unmanned aerial systems manufacturing initiative established with a mandate to advance indigenous aerospace engineering and manufacturing capabilities.
            </p>
          </section>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════
            2. SECOND: THE 4 CIRCLE IMAGE & STORY PART (Image 2)
        ══════════════════════════════════════════════════════ */}
        <section className="space-y-16">
          {/* Top: Two-column narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 lg:gap-14 items-start">
            {/* Left Column: Title + "WHERE IT STARTED" Card */}
            <ScrollReveal direction="up" delay={80} className="w-full">
              <div className="space-y-6">
                <h2
                  className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.08]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  It started with a single vision.
                </h2>

                {/* Where it started card */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/15 transition-all duration-500 hover:border-sky-400/40 group min-h-[280px] sm:min-h-[320px] flex flex-col justify-between shadow-2xl"
                >
                  {/* Background image filling the whole box */}
                  <Image
                    src="/assets/dronetechnician.jpg"
                    alt="Where it started - Drone Technician"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    priority
                  />

                  {/* Dark gradient overlay for contrast and legibility */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(7, 11, 20, 0.65) 0%, rgba(7, 11, 20, 0.82) 50%, rgba(7, 11, 20, 0.95) 100%)",
                    }}
                  />

                  {/* Top: Header tag */}
                  <div className="relative z-10">
                    <span
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-sky-400 font-semibold px-2.5 py-1 rounded-full bg-black/40 border border-sky-400/30 backdrop-blur-md"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      WHERE IT STARTED
                    </span>
                  </div>

                  {/* Bottom: Information text */}
                  <div className="relative z-10 pt-16 sm:pt-20 space-y-1.5">
                    <h3
                      className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight drop-shadow-md"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Skywin Aeronautics Industry
                    </h3>
                    <p
                      className="text-xs uppercase tracking-[0.18em] text-sky-300 font-semibold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Aeronautics Industry
                    </p>
                    <p
                      className="text-[11.5px] text-white/70 tracking-wider font-medium"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Inaugurated March 8, 2025 · Addis Ababa
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: Story text with bold highlights */}
            <ScrollReveal direction="up" delay={160} className="w-full">
              <div
                className="space-y-6 text-sm sm:text-base leading-relaxed text-white/65"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <p>
                  SkyWin Aeronautics Industry was inaugurated on March 8, 2025 by
                  the Federal Democratic Republic of Ethiopia Prime Minister, H.E
                  Abiy Ahmed (PhD), as a strategic national unmanned aerial
                  systems manufacturing initiative. Every milestone taught our
                  engineers something new — so we said yes to harder aerodynamic
                  problems, then harder systems again.
                </p>

                <p>
                  Initial airframes became comprehensive tactical platforms.
                  Platforms became integrated systems that safeguard national
                  assets, monitor agricultural yields, and inspect strategic
                  infrastructure. The lesson stuck:{" "}
                  <strong className="text-white font-semibold">
                    say yes, then engineer the how. There is no challenge in
                    unmanned aeronautics we won&apos;t take on.
                  </strong>
                </p>

                <p>
                  With dedicated manufacturing hangars, composite prototyping
                  laboratories, and certified flight-testing airspace, we build
                  around one constant: never stand still. That&apos;s the real
                  mission: we don&apos;t assemble off-the-shelf parts like a
                  commodity. We engineer sovereign intellectual property from the
                  ground up — ensuring local technology independence as the global
                  aerospace horizon accelerates.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom: 4 Circular Milestone Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-4 sm:pt-6">
            {/* Circle 01 */}
            <ScrollReveal direction="up" delay={0} className="w-full flex justify-center">
              <div
                className="w-[210px] h-[210px] max-w-[210px] sm:w-full sm:h-auto sm:max-w-none aspect-square mx-auto rounded-full border border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-white/25 hover:scale-[1.03]"
                style={{
                  background: "rgba(11, 17, 28, 0.70)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="text-[10px] sm:text-[11px] text-white/40 tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  01
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono tracking-[0.16em] uppercase text-white/50 mt-0.5 sm:mt-1 mb-1 sm:mb-2"
                >
                  2025 · THE START
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  National Mandate
                </h3>
                <p
                  className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-1 sm:mt-2 leading-relaxed px-2"
                >
                  Inaugurated by H.E. Prime Minister Abiy Ahmed to establish
                  sovereign aerospace manufacturing.
                </p>
              </div>
            </ScrollReveal>

            {/* Circle 02 */}
            <ScrollReveal direction="up" delay={90} className="w-full flex justify-center">
              <div
                className="w-[210px] h-[210px] max-w-[210px] sm:w-full sm:h-auto sm:max-w-none aspect-square mx-auto rounded-full border border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-white/25 hover:scale-[1.03]"
                style={{
                  background: "rgba(11, 17, 28, 0.70)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="text-[10px] sm:text-[11px] text-white/40 tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  02
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono tracking-[0.16em] uppercase text-white/50 mt-0.5 sm:mt-1 mb-1 sm:mb-2"
                >
                  GROWTH
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Hangars & Labs
                </h3>
                <p
                  className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-1 sm:mt-2 leading-relaxed px-2"
                >
                  Dedicated manufacturing hangars, R&D labs, and testing
                  departments achieved production readiness.
                </p>
              </div>
            </ScrollReveal>

            {/* Circle 03 */}
            <ScrollReveal direction="up" delay={180} className="w-full flex justify-center">
              <div
                className="w-[210px] h-[210px] max-w-[210px] sm:w-full sm:h-auto sm:max-w-none aspect-square mx-auto rounded-full border border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-white/25 hover:scale-[1.03]"
                style={{
                  background: "rgba(11, 17, 28, 0.70)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="text-[10px] sm:text-[11px] text-white/40 tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  03
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono tracking-[0.16em] uppercase text-white/50 mt-0.5 sm:mt-1 mb-1 sm:mb-2"
                >
                  SCALE
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Mission UAVs
                </h3>
                <p
                  className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-1 sm:mt-2 leading-relaxed px-2"
                >
                  Full-scale deployments for agriculture, national infrastructure,
                  tactical surveillance, and training.
                </p>
              </div>
            </ScrollReveal>

            {/* Circle 04 (Active / Highlighted with theme color) */}
            <ScrollReveal direction="up" delay={270} className="w-full flex justify-center">
              <div
                className="w-[210px] h-[210px] max-w-[210px] sm:w-full sm:h-auto sm:max-w-none aspect-square mx-auto rounded-full border-2 border-sky-400/80 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "rgba(14, 22, 36, 0.85)",
                  boxShadow: "0 0 30px rgba(56, 189, 248, 0.25)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <span
                  className="text-[10px] sm:text-[11px] text-white/40 tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  04
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono tracking-[0.16em] uppercase text-sky-400 font-bold mt-0.5 sm:mt-1 mb-1 sm:mb-2"
                >
                  TODAY & BEYOND
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Vision 2030
                </h3>
                <p
                  className="text-[10px] sm:text-[11px] text-white/60 font-mono mt-1 sm:mt-2 leading-relaxed px-2"
                >
                  Next-generation autonomous avionics, AI payload integration, and
                  scaling an African aerospace powerhouse.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            3. AT THE END: FREQUENTLY ASKED QUESTIONS (Image 3)
        ══════════════════════════════════════════════════════ */}
        <section className="space-y-6 pt-4">
          <ScrollReveal direction="up" delay={40}>
            <p
              className="text-xs uppercase tracking-[0.22em] text-white/40 mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              · FREQUENTLY ASKED
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <ScrollReveal key={index} direction="up" delay={(index % 4) * 70}>
                <div
                  className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 transition-all duration-300 hover:border-white/20"
                  style={{
                    background: "rgba(11, 17, 28, 0.75)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <h3
                    className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {faq.q}
                  </h3>
                  <p
                    className="text-xs sm:text-sm text-white/60 leading-relaxed font-mono"
                  >
                    {faq.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Bottom Operational Badge ── */}
        <ScrollReveal direction="up" delay={60}>
          <div className="pt-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/40 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Skywin Aeronautics Industry · Sovereign Engineering</span>
            </div>
            <p
              className="text-xs text-white/30 tracking-wider"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Addis Ababa, Ethiopia · Leading African Aeronautics
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
