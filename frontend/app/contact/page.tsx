import { ContactScene } from "../components/ClientComponents";
import ContactWizard from "../components/ContactWizard";

export const metadata = {
  title: "Skywin Aeronautics | Contact",
  description:
    "Direct contact and engineering consultation with Skywin Aeronautics. Answer four quick questions to connect with our aerospace team.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden pt-20 sm:pt-24 pb-16">
      {/* ── Dot Matrix Overlay (matches WeeVolveIt aesthetic) ── */}
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
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.15) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.35) 0%, rgba(35, 54, 79, 0.2) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Three.js Globe & Aerospace Signal Arcs Ambient Background ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none opacity-30 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <ContactScene />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* ── WeeVolveIt-style Typography Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          {/* Clean balanced display headline */}
          <h1
            className="text-[clamp(1.75rem,3.8vw,2.8rem)] font-semibold leading-[1.12] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let&apos;s build
            <br />
            what&apos;s next.
          </h1>

          <p
            className="mt-4 sm:mt-5 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed text-white/60"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            No forms-to-nowhere. Answer four quick questions and a senior
            consultant reviews it personally — usually back to you within one
            business day.
          </p>
        </div>

        {/* ── Interactive Multi-Step Form + Direct Reach Out Cards ── */}
        <ContactWizard
          directEmail="hr1.skywin@gmail.com"
          directPhone="+1 956 272 1689"
        />
      </div>
    </main>
  );
}
