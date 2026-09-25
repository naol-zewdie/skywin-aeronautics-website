import Link from "next/link";

interface ServicesCTAProps {
  headline?: string;
  subtitle?: string;
  buttonText?: string;
  href?: string;
  className?: string;
}

export default function ServicesCTA({
  headline = "Ready for aerospace solutions that work as hard as you do?",
  subtitle = "Tell us about your mission requirements and operational needs. We'll come back with technical architecture, payload options, and a costed plan — sovereign engineering from day one.",
  buttonText = "GET IN TOUCH",
  href = "/contact",
  className = "my-16 sm:my-24",
}: ServicesCTAProps) {
  return (
    <section className={`relative w-full max-w-5xl mx-auto px-4 sm:px-6 ${className}`}>
      {/* ── Outer Card Container matching Image 4 ── */}
      <div
        className="relative rounded-2xl sm:rounded-3xl p-8 sm:p-14 md:p-16 text-center overflow-hidden transition-all duration-300"
        style={{
          background: "rgba(11, 17, 28, 0.88)",
          border: "1px solid rgba(69, 87, 109, 0.22)",
          boxShadow:
            "0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(69, 87, 109, 0.12)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Subtle top hairline highlight */}
        <div
          className="absolute -top-[1px] left-1/4 right-1/4 h-[1px] opacity-75 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, #45576D, #6a7e98, transparent)",
          }}
        />

        {/* Ambient background glow inside card */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "#45576D" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2
            className="text-2xl sm:text-4xl md:text-[44px] font-bold text-white tracking-tight leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {headline}
          </h2>

          <p
            className="max-w-xl mx-auto text-xs sm:text-sm text-white/60 leading-relaxed"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            {subtitle}
          </p>

          <div className="pt-4">
            <Link
              href={href}
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-mono font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #23364F 0%, #45576D 100%)",
                border: "1px solid rgba(106, 126, 152, 0.40)",
                boxShadow: "0 0 24px rgba(69, 87, 109, 0.45)",
              }}
            >
              <span>{buttonText}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
