export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import Button from "./components/Button";
import Container from "./components/Container";
import Section from "./components/Section";
import ProductsSection from "./components/ProductsSection";
import ScrollReveal from "./components/ScrollReveal";
import ThreeDCard from "./components/ThreeDCard";
import SectionTag from "./components/SectionTag";
import { DroneGlobe } from "./components/ClientComponents";
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

      {/* ═══ HERO — Full screen, globe center, massive headline below ═══ */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: "100px" }}
      >
        {/* Globe — centerpiece */}
        <div className="relative w-full max-w-2xl mx-auto" style={{ height: "480px" }}>
          <DroneGlobe />
        </div>

        {/* Hero text — below the globe */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 -mt-8">
          <SectionTag>Skywin Aeronautics</SectionTag>

          <h1
            className="mt-4 text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.92] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Precision UAV<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #38bdf8 0%, #7dd3fc 50%, #ffffff 100%)" }}
            >
              Manufacturing.
            </span>
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
            <PrimaryPill href="/products">View Products →</PrimaryPill>
            <GhostPill href="/about">Our Story</GhostPill>
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
                        border: "1px solid rgba(56,189,248,0.10)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.35), 0 0 24px rgba(14,165,233,0.10)" }}
                      />
                      {/* Number */}
                      <span
                        className="block text-xs mb-4"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(56,189,248,0.50)", letterSpacing: "0.12em" }}
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
                        className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors duration-300 mb-1"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                      >
                        {service.title}
                      </h3>
                      <p className="text-xs leading-5" style={{ fontFamily: "var(--font-mono)", color: "rgba(240,244,255,0.35)", letterSpacing: "0.03em" }}>
                        {service.description.slice(0, 80)}…
                      </p>
                      <div className="mt-4 h-px w-0 group-hover:w-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500 rounded-full" />
                    </Link>
                  </ThreeDCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ PRODUCTS — solid dark panel ═══ */}
        <ScrollReveal>
          <Section>
            <div
              className="relative overflow-hidden rounded-[2rem] px-6 py-16 sm:px-10 sm:py-20"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #050d1a 50%, #0a0f1a 100%)',
                border: '1px solid rgba(56,189,248,0.12)',
                boxShadow: '0 0 60px rgba(14,165,233,0.08)',
              }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 tech-grid opacity-15 rounded-[2rem]" />
              {/* Top electric line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)' }}
              />

              <div className="relative space-y-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <SectionTag>Featured Products</SectionTag>
                    <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Selected Products.</h2>
                  </div>
                  <Button
                    href="/products"
                    variant="primary"
                    className="!bg-[#0ea5e9] hover:!bg-[#38bdf8] !text-black !font-bold hover:!shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                  >
                    View all products
                  </Button>
                </div>
                <ProductsSection />
              </div>
            </div>
          </Section>
        </ScrollReveal>

        {/* ═══ CTA — electric gradient ═══ */}
        <ScrollReveal delay={100}>
          <Section>
            <div className="relative overflow-hidden rounded-[2rem] p-12 sm:p-16"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #0a1628 40%, #0f1f3d 70%, #23364F 100%)',
                border: '1px solid rgba(56,189,248,0.18)',
              }}
            >
              {/* Electric top border */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)' }}
              />
              {/* Background glow spots */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-25 animate-mesh-flow"
                style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)' }}
              />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15 animate-mesh-flow"
                style={{ background: 'radial-gradient(circle, rgba(35,54,79,0.5) 0%, transparent 70%)', animationDelay: '-4s' }}
              />
              <div className="absolute inset-0 tech-grid opacity-15" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <SectionTag>Get In Touch</SectionTag>
                  <h2 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Ready to work<br />with Skywin?
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-white/65">
                    Contact our team for aerospace engineering, consulting, or collaboration inquiries.
                  </p>
                </div>
                <Button
                  href="/contact"
                  className="!bg-[#0ea5e9] hover:!bg-[#38bdf8] !text-black !font-bold hover:!shadow-[0_0_40px_rgba(14,165,233,0.7)] transition-all duration-300 whitespace-nowrap"
                >
                  Start a conversation
                </Button>
              </div>
            </div>
          </Section>
        </ScrollReveal>

      </Container>
    </main>
  );
}
