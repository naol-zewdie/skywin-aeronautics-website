import Container from "../components/Container";
import Section from "../components/Section";

export const metadata = {
  title: "Skywin Aeronautics | About",
  description: "Learn more about Skywin Aeronautics, our mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">About Skywin</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Leading African Aeronautics Innovation.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              A strategic national unmanned aerial systems manufacturing initiative established with a mandate to advance indigenous aerospace engineering and manufacturing capabilities.
            </p>
          </div>
        </Section>

        <Section>
          <div className="space-y-12">
            {/* About Us Section */}
            <div className="max-w-4xl">
              <h2 className="text-3xl font-semibold text-[color:var(--primary)] mb-6">ABOUT US</h2>
              <div className="space-y-4 text-lg leading-8 text-[color:var(--muted)]">
                <p>
                  SkyWin aeronautics industry was inaugurated on March 8, 2025 by the Federal Democratic Republic of Ethiopia Prime Minister, H.E Abiy Ahmed (PhD), as a strategic national unmanned aerial systems manufacturing initiative.
                </p>
                <p>
                  The company was established with a national mandate to reduce external technology dependency while strengthening indigenous engineering intellectual property and local aerospace manufacturing capability.
                </p>
                <p>
                  SkyWin aeronautics industry was formed through a strategic integration of local engineering talent, institutional capacities and system resources drawn from multiple specialized national organizations into a unified UAV manufacturing framework.
                </p>
                <p>
                  With the establishment of dedicated manufacturing hangars, research and development laboratories, and formal testing and commissioning departments, the company achieved full production and deployment readiness.
                </p>
                <p>
                  Today, SkyWin aeronautics industry operates as a fully integrated UAV manufacturer delivering mission-ready aerial platforms for national development, security, and institutional operations, while continuously advancing indigenous aerospace engineering research to support future national programs.
                </p>
              </div>
            </div>

            {/* Vision Section */}
            <div className="max-w-4xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] p-8 shadow-sm">
              <h2 className="text-3xl font-semibold text-[color:var(--primary)] mb-4">OUR VISION</h2>
              <p className="text-xl leading-8 text-[color:var(--muted)] font-medium">
                To establish a globally competitive African aeronautics and drone technology powerhouse by 2030.
              </p>
            </div>

            {/* Mission Section */}
            <div className="max-w-4xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] p-8 shadow-sm">
              <h2 className="text-3xl font-semibold text-[color:var(--primary)] mb-4">OUR MISSION</h2>
              <p className="text-xl leading-8 text-[color:var(--muted)] font-medium">
                To design, manufacture, and deliver high-quality, multi-purpose UAVs that address national strategic priorities and global market demands, driven by cutting-edge technological innovation.
              </p>
            </div>
          </div>
        </Section>
      </Container>
      
      {/* Floating Scroll to Top Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 ring-2 ring-[color:var(--accent)]/20 ring-offset-4 ring-offset-[color:var(--background)] md:bottom-12 md:right-12"
        aria-label="Scroll to top"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M5 10l7-7m0 0l-7 7" />
        </svg>
      </button>
    </main>
  );
}
