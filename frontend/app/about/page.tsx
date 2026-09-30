import Image from "next/image";
import { AboutScene } from "../components/ClientComponents";
import ScrollReveal from "../components/ScrollReveal";

export const metadata = {
  title: "Skywin Aeronautics | About Us",
  description:
    "Learn about SkyWin Aeronautics Industry — our founding, national mandate, indigenous UAV manufacturing, mission, and Vision 2030.",
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
            1. ABOUT US HEADER
        ══════════════════════════════════════════════════════ */}
        <ScrollReveal direction="up" delay={50}>
          <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
            {/* Top pill badges */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] text-sky-400 border border-sky-400/30 bg-sky-400/10"
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

            {/* Headline: Clean white sans-serif in the reference style */}
            <h1
              className="text-[clamp(2.5rem,5.8vw,4.5rem)] font-bold text-white tracking-[-0.025em] leading-[1.08] mt-2 mb-6 font-sans"
              style={{
                fontFamily:
                  'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              About Us
            </h1>

            {/* Subtitle */}
            <p
              className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-white/70"
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
            2. STORY & TWO CIRCLES (OUR VISION & OUR MISSION)
        ══════════════════════════════════════════════════════ */}
        <section className="space-y-16">
          {/* Top: Two-column narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 lg:gap-14 items-start">
            {/* Left Column: Title + "WHERE IT STARTED" Card */}
            <ScrollReveal direction="up" delay={80} className="w-full lg:sticky lg:top-28">
              <div className="space-y-6">
                <h2
                  className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.12]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  It started with a single vision.
                </h2>

                {/* Where it started card */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/15 transition-all duration-500 hover:border-sky-400/40 group min-h-[300px] sm:min-h-[360px] flex flex-col justify-between shadow-2xl"
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

            {/* Right Column: Story text with 5 paragraphs */}
            <ScrollReveal direction="up" delay={160} className="w-full">
              <div
                className="space-y-6 text-sm sm:text-base leading-relaxed text-white/75"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <p>
                  SkyWin aeronautics industry was inaugurated on March 8, 2025 by
                  the Federal Democratic Republic of Ethiopia Prime Minister, H.E
                  Abiy Ahmed (PhD), as a strategic national unmanned aerial
                  systems manufacturing initiative.
                </p>

                <p>
                  The company was established with a national mandate to reduce
                  external technology dependency while strengthening indigenous
                  engineering intellectual property and local aerospace
                  manufacturing capability.
                </p>

                <p>
                  SkyWin aeronautics industry was formed through a strategic
                  integration of local engineering talent, institutional
                  capacities and system resources drawn from multiple specialized
                  national organizations into a unified UAV manufacturing
                  framework.
                </p>

                <p>
                  With the establishment of dedicated manufacturing hangars,
                  research and development laboratories, and formal testing and
                  commissioning departments, the company achieved full production
                  and deployment readiness.
                </p>

                <p>
                  Today, SkyWin aeronautics industry operates as a fully integrated
                  UAV manufacturer delivering mission-ready aerial platforms for
                  national development, security, and institutional operations,
                  while continuously advancing indigenous aerospace engineering
                  research to support future national programs.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom: 2 Circular Milestone Badges for OUR VISION & OUR MISSION */}
          <div className="pt-6 sm:pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 max-w-4xl mx-auto">
              {/* Circle 01: OUR VISION */}
              <ScrollReveal direction="up" delay={80} className="w-full flex justify-center">
                <div
                  className="w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[350px] lg:h-[350px] aspect-square rounded-full border-2 border-sky-400/80 p-6 sm:p-9 flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-sky-300 hover:scale-[1.03] shadow-2xl relative overflow-hidden group"
                  style={{
                    background: "rgba(14, 22, 36, 0.85)",
                    boxShadow: "0 0 35px rgba(56, 189, 248, 0.22)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* Subtle inner ambient glow */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span
                      className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-sky-400 font-bold mb-1.5"
                    >
                      HORIZON 2030
                    </span>
                    <h3
                      className="text-xl sm:text-2xl lg:text-[26px] font-bold text-sky-400 tracking-wider uppercase mb-3 drop-shadow-sm"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      OUR VISION
                    </h3>
                    <p
                      className="text-xs sm:text-sm text-white/80 font-mono leading-relaxed max-w-[240px] sm:max-w-[270px]"
                    >
                      To establish a globally competitive African aeronautics and drone technology powerhouse by 2030.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Circle 02: OUR MISSION */}
              <ScrollReveal direction="up" delay={160} className="w-full flex justify-center">
                <div
                  className="w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[350px] lg:h-[350px] aspect-square rounded-full border-2 border-sky-400/80 p-6 sm:p-9 flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-sky-300 hover:scale-[1.03] shadow-2xl relative overflow-hidden group"
                  style={{
                    background: "rgba(14, 22, 36, 0.85)",
                    boxShadow: "0 0 35px rgba(56, 189, 248, 0.22)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* Subtle inner ambient glow */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span
                      className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-sky-400 font-bold mb-1.5"
                    >
                      STRATEGIC MANDATE
                    </span>
                    <h3
                      className="text-xl sm:text-2xl lg:text-[26px] font-bold text-sky-400 tracking-wider uppercase mb-3 drop-shadow-sm"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      OUR MISSION
                    </h3>
                    <p
                      className="text-xs sm:text-[13px] text-white/80 font-mono leading-relaxed max-w-[240px] sm:max-w-[270px]"
                    >
                      To design, manufacture, and deliver high-quality, multi-purpose UAVs that address national strategic priorities and global market demands, driven by cutting-edge technological innovation.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
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
      </div>
    </main>
  );
}
