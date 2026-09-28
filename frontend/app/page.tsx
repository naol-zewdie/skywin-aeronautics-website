export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import ServicesCTA from "./components/ServicesCTA";
import Container from "./components/Container";
import Section from "./components/Section";
import ProductsSection from "./components/ProductsSection";
import FeaturedProducts from "./components/FeaturedProducts";
import ScrollReveal from "./components/ScrollReveal";
import ThreeDCard from "./components/ThreeDCard";
import SectionTag from "./components/SectionTag";
import { DroneGlobe, StatsTicker, HeroInteractive } from "./components/ClientComponents";
import { PrimaryPill, GhostPill } from "./components/HeroCTAs";

const services = [
  {
    title: "Aerial Mapping and Surveying",
    description: "We provide accurate aerial mapping and surveying solutions using advanced drone technology. Our services support land assessment, construction planning, and geospatial data collection. We ensure high-resolution outputs that help clients make informed decisions efficiently.",
    image: "/assets/surveying.JPG",
  },
  {
    title: "Drone Piloting Training",
    description: "Our drone piloting training equips individuals with practical flying skills and industry knowledge. Trainees learn safety procedures, flight control, and mission planning. The program is designed for both beginners and those looking to enhance their expertise.",
    image: "/assets/training.JPG",
  },
  {
    title: "Technician Training",
    description: "We offer technician training focused on drone maintenance, troubleshooting, and system management. Participants gain hands-on experience with real equipment and tools. This training prepares technicians to ensure reliable and safe drone operations.",
    image: "/assets/dronetechnician.jpg",
  },
  {
    title: "Drone Engineering Training",
    description: "Our drone engineering training covers design, assembly, and system integration. Students learn the technical foundations behind drone technology and innovation. The course is ideal for those interested in building and improving drone systems.",
    image: "/assets/vtolservice.JPG",
  },
  {
    title: "Consultancy",
    description: "We provide expert consultancy services tailored to your drone-related needs. Our team supports project planning, technology selection, and operational strategy. We help organizations adopt drone solutions effectively and responsibly.",
    image: "/simulation.jpg",
  },
  {
    title: "Agricultural and Infrastructure Inspection",
    description: "Our drones enable efficient inspection of agricultural fields and infrastructure assets. We help identify issues such as crop health concerns, structural damage, or maintenance needs. This approach saves time while improving accuracy and safety.",
    image: "/consulting.jpg",
  },
  {
    title: "Customized Missions",
    description: "We design and execute customized drone missions based on specific client requirements. Whether for research, monitoring, or specialized operations, we adapt our solutions accordingly. Our team ensures precision, flexibility, and reliable results in every project.",
    image: "/drone.jpg",
  },
];


export default function Home() {
  return (
    <main className="bg-transparent text-[color:var(--foreground)]">

      {/* ═══ HERO — Modern Split Layout: Text & CTAs Left, 3D Drone Right ═══ */}
      <section
        className="relative flex items-center min-h-[92vh] lg:min-h-screen pt-28 pb-16 lg:pt-24 lg:pb-12 overflow-hidden"
      >
        {/* Mouse-trail particles + click ripples overlay */}
        <HeroInteractive />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs */}
            <ScrollReveal direction="up" delay={60} className="lg:col-span-7 w-full">
              <div className="flex flex-col items-start text-left space-y-6">
                <SectionTag>Skywin Aeronautics</SectionTag>

                {/* Reduced and balanced display headline */}
                <h1
                  className="text-[clamp(2.1rem,4.2vw,3.6rem)] font-bold leading-[1.08] tracking-tight text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Precision UAV<br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #45576D 0%, #8fa3bf 50%, #ffffff 100%)",
                    }}
                  >
                    Manufacturing.
                  </span>
                </h1>

                {/* Monospace Subtitle */}
                <p
                  className="max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-white/60"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Sovereign unmanned aerial systems, tactical defense platforms,
                  and specialized industrial airframes engineered and manufactured
                  in-house for critical aerospace missions.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <PrimaryPill href="/products">View Products →</PrimaryPill>
                  <GhostPill href="/about">Our Story</GhostPill>
                </div>

                {/* Quick specs / trust points pill */}
                <div
                  className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg text-left"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6a7e98]">Standard</p>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1">MIL-SPEC / IP67</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6a7e98]">Avionics</p>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1">Autonomous AI</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6a7e98]">Build</p>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1">100% In-House</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: 3D Drone Model */}
            <ScrollReveal direction="up" delay={180} className="lg:col-span-5 w-full">
              <div className="relative w-full flex items-center justify-center">
                {/* Soft radial backdrop aura behind drone */}
                <div
                  className="absolute inset-0 pointer-events-none blur-3xl opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(69, 87, 109, 0.40) 0%, rgba(35, 54, 79, 0.18) 50%, transparent 75%)",
                  }}
                  aria-hidden="true"
                />

                {/* Decorative HUD concentric coordinate rings behind drone */}
                <div
                  className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-white/[0.05] pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full border border-dashed border-[#45576D]/25 pointer-events-none animate-spin"
                  style={{ animationDuration: "60s" }}
                  aria-hidden="true"
                />

                {/* 3D Drone Canvas Container with smooth modern edge masking */}
                <div
                  className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] flex items-center justify-center"
                  style={{
                    maskImage:
                      "radial-gradient(ellipse 92% 90% at 50% 50%, black 70%, transparent 100%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 92% 90% at 50% 50%, black 70%, transparent 100%)",
                  }}
                >
                  <DroneGlobe />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Container>

        {/* ─── Services Cards ─── */}
        <Section>
          <div className="relative">
            <ScrollReveal>
              <div className="mb-12">
                <SectionTag>What We Offer</SectionTag>
                <h2
                  className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Company Overview.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7" style={{ fontFamily: "var(--font-mono)", color: "rgba(240,244,255,0.40)", fontSize: "13px", letterSpacing: "0.04em" }}>
                  Engineering, design, validation, manufacturing,<br />and operational consulting for aerospace.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((service, i) => (
                <ScrollReveal key={service.title} delay={i * 120}>
                  <ThreeDCard className="h-full">
                    <Link
                      href="/services"
                      className="group relative block overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 h-full"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(69, 87, 109,0.10)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: "inset 0 0 0 1px rgba(69, 87, 109,0.35), 0 0 24px rgba(69, 87, 109,0.10)" }}
                      />
                      {/* Number */}
                      <span
                        className="block text-xs mb-4"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(69, 87, 109,0.50)", letterSpacing: "0.12em" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3]">
                        <Image src={service.image} alt={service.title} width={320} height={240}
                          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>
                      {/* Content */}
                      <h3
                        className="text-sm font-bold text-white group-hover:text-[#45576D] transition-colors duration-300 mb-1"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                      >
                        {service.title}
                      </h3>
                      <p className="text-xs leading-5" style={{ fontFamily: "var(--font-mono)", color: "rgba(240,244,255,0.35)", letterSpacing: "0.03em" }}>
                        {service.description.slice(0, 80)}…
                      </p>
                      <div className="mt-4 h-px w-0 group-hover:w-full bg-gradient-to-r from-[#45576D] to-[#45576D] transition-all duration-500 rounded-full" />
                    </Link>
                  </ThreeDCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ TICKER — endless marquee between overview and products ═══ */}
        <ScrollReveal direction="up" delay={60}>
          <div className="py-2">
            <StatsTicker />
          </div>
        </ScrollReveal>

        {/* ═══ FEATURED PRODUCTS — alternating slide-up rows ═══ */}
        <FeaturedProducts />

        {/* ═══ BOTTOM CTA (Matching Services page) ═══ */}
        <ScrollReveal direction="up" delay={80}>
          <ServicesCTA
            className="mt-2 sm:mt-4 mb-16 sm:mb-20"
            headline="Ready for aerospace solutions that work as hard as you do?"
            subtitle="Tell us about your mission requirements and operational needs. We'll come back with technical architecture, payload options, and a costed plan — sovereign engineering from day one."
            buttonText="GET IN TOUCH"
            href="/contact"
          />
        </ScrollReveal>

      </Container>
    </main>
  );
}

