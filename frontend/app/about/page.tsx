import Image from "next/image";
import Container from "../components/Container";
import Section from "../components/Section";
import ScrollReveal from "../components/ScrollReveal";
import CountUp from "../components/CountUp";

export const metadata = {
  title: "Skywin Aeronautics | About",
  description: "Learn more about Skywin Aeronautics, our mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12" backgroundImage="/assets/Drone-1.jpg">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--foreground)]">About Skywin</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Leading African Aeronautics Innovation.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-[color:var(--muted)]">
              A strategic national unmanned aerial systems manufacturing initiative established with a mandate to advance indigenous aerospace engineering and manufacturing capabilities.
            </p>
          </div>
        </Section>

        {/* Animated Stats Banner */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl my-8 p-8 sm:p-12" style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute inset-0 tech-grid opacity-20" />
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
              <div>
                <p className="text-4xl font-bold">
                  <CountUp target={2025} suffix="" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70 mt-1">Founded</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  <CountUp target={7} suffix="+" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70 mt-1">Services</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  <CountUp target={100} suffix="%" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70 mt-1">Indigenous</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  <CountUp target={2030} suffix="" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70 mt-1">Vision Year</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <Section>
          <div className="space-y-10">
            {/* Image + National Inauguration two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Row 1 */}
                <ScrollReveal>
                  <div className="relative min-h-[320px] overflow-hidden text-center">
                    <Image
                      src="/assets/droneinhangar.jpg"
                      alt="Drone in hangar"
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={150}>
                  <div className="flex flex-col justify-center text-left">
                    <h3 className="text-2xl font-semibold text-[color:var(--foreground)] mb-4">
                      National Inauguration
                    </h3>
                    <p className="text-lg leading-8 text-justify text-[color:var(--muted)]">
                      SkyWin Aeronautics Industry was inaugurated on March 8, 2025 by the Federal Democratic Republic of Ethiopia Prime Minister, H.E Abiy Ahmed (PhD), as a strategic national unmanned aerial systems manufacturing initiative. The company was established with a national mandate to reduce external technology dependency while strengthening indigenous engineering intellectual property and local aerospace manufacturing capability.
                    </p>
                  </div>
                </ScrollReveal>
                {/* Row 2 */}
                <ScrollReveal delay={80}>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-[color:var(--foreground)] mb-2 flex items-center justify-start gap-2">
                      <Image src="/assets/building_11645839.png" alt="" width={32} height={32} className="w-8 h-8 inline-block" />
                      Infrastructure and Capability Development
                    </h4>
                    <p className="text-base leading-7 text-justify text-[color:var(--muted)]">
                      With the establishment of dedicated manufacturing hangars, research and development laboratories, and formal testing and commissioning departments, the company achieved full production and deployment readiness.
                    </p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={160}>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-[color:var(--foreground)] mb-2 flex items-center justify-start gap-2">
                      <Image src="/assets/certificate_11761894.png" alt="" width={32} height={32} className="w-8 h-8 inline-block" />
                      Current Operations
                    </h4>
                    <p className="text-base leading-7 text-justify text-[color:var(--muted)]">
                      Today, SkyWin Aeronautics Industry operates as a fully integrated UAV manufacturer delivering mission-ready aerial platforms for national development, security, and institutional operations, while continuously advancing indigenous aerospace engineering research to support future national programs.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Drone icon divider */}
              <ScrollReveal>
                <div className="flex justify-center">
                  <div className="bg-white rounded-full p-12 shadow-md">
                    <Image src="/assets/drone_15762122.png" alt="" width={128} height={128} className="w-32 h-32" />
                  </div>
                </div>
              </ScrollReveal>

              {/* Vision & Mission text */}
              <ScrollReveal>
                <div className="mt-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="text-center max-w-xs mx-auto">
                      <h2 className="text-2xl font-semibold text-[color:var(--foreground)] mb-4 flex items-center justify-center gap-2">
                        <Image src="/assets/light-bulb_15559817.png" alt="" width={32} height={32} className="w-8 h-8 inline-block" />
                        OUR VISION
                      </h2>
                      <p className="text-lg leading-8 text-justify text-[color:var(--muted)]">
                        To establish a globally competitive African aeronautics and drone technology powerhouse by 2030.
                      </p>
                    </div>
                    <div className="text-center max-w-xs mx-auto">
                      <h2 className="text-2xl font-semibold text-[color:var(--foreground)] mb-4 flex items-center justify-center gap-2">
                        <Image src="/assets/target_5451975.png" alt="" width={32} height={32} className="w-8 h-8 inline-block" />
                        OUR MISSION
                      </h2>
                      <p className="text-lg leading-8 text-justify text-[color:var(--muted)]">
                        To design, manufacture, and deliver high-quality, multi-purpose UAVs that address national strategic priorities and global market demands, driven by cutting-edge technological innovation.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Full-width drone technician image below */}
              <div className="-mx-6 overflow-hidden">
                <Image
                  src="/assets/dronetechnician.jpg"
                  alt="Drone technician"
                  width={1200}
                  height={300}
                  className="w-full h-[300px] object-cover"
                  sizes="100vw"
                />
              </div>

              {/* FAQ Section */}
              <div className="space-y-4 text-left">
                <ScrollReveal>
                  <h2 className="text-3xl font-semibold text-[color:var(--foreground)] mb-8 text-center">
                    FREQUENTLY ASKED QUESTIONS
                  </h2>
                </ScrollReveal>

                {[
                  {
                    q: "What does SkyWin Aeronautics Industry produce?",
                    a: "SkyWin designs and manufactures unmanned aerial vehicles (UAVs), along with integrated subsystems including airframes, avionics integration, ground control interfaces, and mission-specific payload configurations.",
                  },
                  {
                    q: "What types of UAV systems does SkyWin develop?",
                    a: "SkyWin develops multi-role UAV platforms designed for operational flexibility, including reconnaissance, surveillance, infrastructure monitoring, and institutional deployment use cases.",
                  },
                  {
                    q: "What is included in Drone Piloting Training?",
                    a: "Participants gain hands-on experience in flight operations, safety procedures, flight control systems, and mission planning using UAV platforms.",
                  },
                  {
                    q: "Are the training sessions practical or theoretical?",
                    a: "All training programs are structured with a strong practical component, ensuring hands-on experience with UAV systems and real operational scenarios.",
                  },
                  {
                    q: "Do you offer consultancy services?",
                    a: "Yes. SkyWin provides technical consultancy in UAV system selection, project planning, operational strategy, and implementation support for organizations.",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 80}>
                    <details className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-sm overflow-hidden">
                      <summary className="flex items-center justify-between p-6 cursor-pointer text-lg font-medium text-left text-[color:var(--foreground)] hover:bg-[color:var(--accent-muted)] transition-colors">
                        <span>{item.q}</span>
                        <svg className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-6 pt-0 text-[color:var(--muted)] leading-7">
                        {item.a}
                      </div>
                    </details>
                  </ScrollReveal>
                ))}
              </div>
          </div>
        </Section>
      </Container>
      
    </main>
  );
}
