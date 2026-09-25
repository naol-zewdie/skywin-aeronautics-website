"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/* ── Placeholder products — replace with real API data later ── */
const FEATURED_PRODUCTS = [
  {
    id: "01",
    tag: "Reconnaissance",
    name: "SW-Alpha X4",
    subtitle: "Precision Quadcopter UAV",
    description:
      "The SW-Alpha X4 is Skywin's flagship surveillance quadcopter, engineered for long-endurance reconnaissance missions. Built with a carbon fiber monocoque frame and dual-redundant flight systems, it delivers unmatched stability in high-wind conditions up to 15 m/s.",
    specs: [
      { label: "Flight Time", value: "55 min" },
      { label: "Range",       value: "12 km" },
      { label: "Payload",     value: "2.4 kg" },
      { label: "Max Speed",   value: "72 km/h" },
    ],
    image: "/assets/product_alpha.jpg",
    accentColor: "#45576D",
    glowColor:   "rgba(59,130,246,0.22)",
  },
  {
    id: "02",
    tag: "Long-Range",
    name: "SW-Condor V2",
    subtitle: "Fixed-Wing VTOL Platform",
    description:
      "The SW-Condor V2 bridges the gap between multirotor agility and fixed-wing endurance. Its tilting-rotor VTOL design enables vertical take-off from any terrain, transitioning seamlessly into aerodynamic cruise flight for area coverage missions exceeding 80 km.",
    specs: [
      { label: "Endurance",   value: "3.5 hr" },
      { label: "Coverage",    value: "80+ km" },
      { label: "Ceiling",     value: "4,500 m" },
      { label: "Wing Span",   value: "2.2 m" },
    ],
    image: "/assets/product_vtol.jpg",
    accentColor: "#6a7e98",
    glowColor:   "rgba(96,165,250,0.20)",
  },
  {
    id: "03",
    tag: "Heavy-Lift",
    name: "SW-Titan H6",
    subtitle: "Industrial Hexacopter",
    description:
      "Designed for the most demanding payload missions, the SW-Titan H6 carries up to 12 kg while maintaining stable flight in turbulent conditions. Six independent motors with triple-redundant ESC architecture ensure operational continuity even during partial motor failure.",
    specs: [
      { label: "Payload",     value: "12 kg" },
      { label: "Flight Time", value: "28 min" },
      { label: "Lift Force",  value: "28 kgf" },
      { label: "IP Rating",   value: "IP54" },
    ],
    image: "/assets/product_heavy.jpg",
    accentColor: "#45576D",
    glowColor:   "rgba(26,95,212,0.22)",
  },
];

/* ── Decorative circle ring ── */
function Ring({
  size, opacity, delay, color = "#45576D",
}: {
  size: number; opacity: number; delay: number; color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:     "absolute",
        width:        size,
        height:       size,
        borderRadius: "50%",
        border:       `1px solid ${color}`,
        opacity,
        animation:    `ring-breathe 5s ${delay}s ease-in-out infinite`,
        pointerEvents:"none",
      }}
    />
  );
}

/* ── Single product row ── */
function ProductRow({
  product,
  index,
}: {
  product: (typeof FEATURED_PRODUCTS)[0];
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0; /* even = image left, odd = image right */

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("fp-row--visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.18 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="fp-row"
      style={{ "--accent": product.accentColor, "--glow": product.glowColor } as React.CSSProperties}
    >
      {/* ── Image side ── */}
      <div className={`fp-image-col ${isEven ? "fp-order-1" : "fp-order-2"}`}>
        {/* Decorative rings behind image */}
        <div className="fp-rings" aria-hidden="true">
          <Ring size={420} opacity={0.10} delay={0}   color={product.accentColor} />
          <Ring size={330} opacity={0.14} delay={0.8} color={product.accentColor} />
          <Ring size={220} opacity={0.20} delay={1.6} color={product.accentColor} />
        </div>

        {/* Glow blob behind image */}
        <div
          aria-hidden="true"
          className="fp-blob"
          style={{ background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${product.glowColor}, transparent)` }}
        />

        {/* Image frame */}
        <div className="fp-image-frame">
          {/* Corner accents */}
          <span className="fp-corner fp-corner-tl" style={{ borderColor: product.accentColor }} />
          <span className="fp-corner fp-corner-br" style={{ borderColor: product.accentColor }} />

          <div className="fp-image-inner">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient overlay */}
            <div className="fp-image-overlay" />
            {/* Product ID badge */}
            <div
              className="fp-id-badge"
              style={{ fontFamily: "var(--font-mono)", borderColor: `${product.accentColor}40`, color: product.accentColor }}
            >
              {product.id}
            </div>
          </div>
        </div>
      </div>

      {/* ── Text side ── */}
      <div className={`fp-text-col ${isEven ? "fp-order-2" : "fp-order-1"}`}>
        {/* Tag */}
        <div className="fp-tag" style={{ fontFamily: "var(--font-mono)", color: product.accentColor }}>
          [ {product.tag} ]
        </div>

        {/* Heading */}
        <h3 className="fp-name" style={{ fontFamily: "var(--font-header)" }}>
          {product.name}
        </h3>
        <p className="fp-subtitle" style={{ fontFamily: "var(--font-mono)" }}>
          {product.subtitle}
        </p>

        {/* Divider */}
        <div className="fp-divider" style={{ background: `linear-gradient(90deg, ${product.accentColor}, transparent)` }} />

        {/* Description */}
        <p className="fp-description" style={{ fontFamily: "var(--font-mono)" }}>
          {product.description}
        </p>

        {/* Specs grid */}
        <div className="fp-specs">
          {product.specs.map((s) => (
            <div key={s.label} className="fp-spec-item" style={{ borderColor: `${product.accentColor}25` }}>
              <span className="fp-spec-value" style={{ fontFamily: "var(--font-header)", color: product.accentColor }}>
                {s.value}
              </span>
              <span className="fp-spec-label" style={{ fontFamily: "var(--font-mono)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function FeaturedProducts() {
  return (
    <section className="fp-section">
      {/* Section header */}
      <div className="fp-header">
        <div
          className="fp-header-tag"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(59,130,246,0.7)" }}
        >
          [ FEATURED PRODUCTS ]
        </div>
        <h2 className="fp-header-title" style={{ fontFamily: "var(--font-header)" }}>
          Selected<br />
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #6a7e98 50%, #45576D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Products.
          </span>
        </h2>
        <p
          className="fp-header-sub"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(232,237,248,0.38)" }}
        >
          Precision-engineered UAV platforms built for real-world aerospace operations.
        </p>
        {/* Center decorative line */}
        <div className="fp-header-line" aria-hidden="true">
          <div className="fp-header-line-inner" />
        </div>
      </div>

      {/* Product rows */}
      <div className="fp-rows">
        {FEATURED_PRODUCTS.map((p, i) => (
          <ProductRow key={p.id} product={p} index={i} />
        ))}
      </div>

      {/* View All Products CTA */}
      <div className="fp-cta-row">
        <a
          href="/products"
          className="fp-cta-btn btn-press"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          View All Products
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* CSS keyframes + all styles */}
      <style>{`
        /* ── Section ── */
        .fp-section {
          position: relative;
          padding: 80px 0 120px;
          overflow: hidden;
        }

        /* ── Header ── */
        .fp-header {
          text-align: left;
          margin-bottom: 72px;
        }
        .fp-header-tag {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .fp-header-title {
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.0;
          color: #ffffff;
          margin: 0 0 20px;
        }
        .fp-header-sub {
          font-size: 13px;
          letter-spacing: 0.04em;
          line-height: 1.7;
          max-width: 420px;
          margin: 0 0 40px;
        }
        .fp-header-line {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }
        .fp-header-line::before,
        .fp-header-line::after {
          content: '';
          flex: 1;
          max-width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.35));
        }
        .fp-header-line::after {
          background: linear-gradient(90deg, rgba(59,130,246,0.35), transparent);
        }
        .fp-header-line-inner {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #45576D;
          box-shadow: 0 0 10px 3px rgba(59,130,246,0.6);
          animation: breathe-glow 2.5s ease-in-out infinite;
        }

        /* ── Rows container ── */
        .fp-rows {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Product row ── */
        .fp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 56px;
          padding: 60px 48px;
          position: relative;
          /* slide-up hidden state */
          opacity: 0;
          transform: translateY(56px);
          transition:
            opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fp-row::before {
          content: '';
          position: absolute;
          left: 48px;
          right: 48px;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.12), transparent);
        }
        .fp-row:last-child::before { display: none; }
        .fp-row--visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Column order */
        .fp-order-1 { order: 1; }
        .fp-order-2 { order: 2; }

        /* ── Image column ── */
        .fp-image-col {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fp-rings {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .fp-blob {
          position: absolute;
          width: 380px;
          height: 300px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
          opacity: 0.7;
        }

        /* ── Image frame ── */
        .fp-image-frame {
          position: relative;
          width: 100%;
          max-width: 440px;
          aspect-ratio: 4/3;
          border-radius: 20px;
          overflow: visible;
        }
        .fp-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-width: 2px;
          border-style: solid;
          z-index: 2;
          pointer-events: none;
        }
        .fp-corner-tl { top: -6px; left: -6px; border-right: none; border-bottom: none; border-radius: 6px 0 0 0; }
        .fp-corner-br { bottom: -6px; right: -6px; border-left: none; border-top: none; border-radius: 0 0 6px 0; }

        .fp-image-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.06),
            0 0 40px var(--glow, rgba(59,130,246,0.12));
        }
        .fp-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(5,10,18,0.25) 0%,
            transparent 50%,
            rgba(5,10,18,0.40) 100%
          );
          pointer-events: none;
        }
        .fp-id-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 11px;
          letter-spacing: 0.14em;
          padding: 4px 10px;
          border: 1px solid;
          border-radius: 100px;
          background: rgba(5,10,18,0.70);
          backdrop-filter: blur(8px);
          z-index: 1;
        }

        /* ── Text column ── */
        .fp-text-col {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .fp-tag {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .fp-name {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #ffffff;
          margin: 0 0 8px;
        }
        .fp-subtitle {
          font-size: 12px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(232,237,248,0.40);
          margin-bottom: 24px;
        }
        .fp-divider {
          height: 1px;
          width: 72px;
          border-radius: 2px;
          margin-bottom: 24px;
          opacity: 0.6;
        }
        .fp-description {
          font-size: 13px;
          line-height: 1.8;
          letter-spacing: 0.03em;
          color: rgba(232,237,248,0.52);
          margin-bottom: 36px;
        }

        /* ── Specs ── */
        .fp-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .fp-spec-item {
          padding: 14px 16px;
          border: 1px solid;
          border-radius: 12px;
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .fp-spec-item:hover {
          background: rgba(59,130,246,0.06);
        }
        .fp-spec-value {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .fp-spec-label {
          font-size: 10px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(232,237,248,0.35);
        }

        /* ── Ring breathe animation ── */
        @keyframes ring-breathe {
          0%, 100% { transform: scale(1);    opacity: inherit; }
          50%       { transform: scale(1.04); opacity: 0; }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .fp-row {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 40px 24px;
          }
          .fp-order-1, .fp-order-2 { order: unset; }
          .fp-image-col { width: 100%; }
          .fp-header { margin-bottom: 60px; }
          .fp-specs { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .fp-name { font-size: 2rem; }
          .fp-header-title { font-size: 2.2rem; }
          .fp-specs { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── View All Products CTA ── */
        .fp-cta-row {
          display: flex;
          justify-content: center;
          padding: 56px 0 24px;
        }
        .fp-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          color: #ffffff;
          background: linear-gradient(135deg, #23364F 0%, #45576D 100%);
          border: 1px solid rgba(59,130,246,0.30);
          border-radius: 100px;
          box-shadow: 0 0 24px rgba(59,130,246,0.18);
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
        }
        .fp-cta-btn:hover {
          background: linear-gradient(135deg, #2e4566 0%, #45576D 100%);
          box-shadow: 0 0 40px rgba(59,130,246,0.40);
          transform: translateY(-2px);
        }
        .fp-cta-btn svg {
          transition: transform 0.2s ease;
        }
        .fp-cta-btn:hover svg {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}


