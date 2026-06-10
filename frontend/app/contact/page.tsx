import Container from "../components/Container";
import Section from "../components/Section";
import ContactForm from "../components/ContactForm";

export const metadata = {
  title: "Skywin Aeronautics | Contact",
  description: "Contact Skywin Aeronautics for aerospace engineering, consulting, or project inquiries.",
};

export default function ContactPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Contact</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Connect with our aerospace team.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Whether you have a question about services, a project need, or collaboration opportunities, we’re available to help.
            </p>
          </div>
        </Section>

        <Section>
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <ContactForm />

            <div className="space-y-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] p-10 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-[color:var(--primary)]">Company Info</h2>
                <p className="mt-4 text-[color:var(--muted)]">Reach out to Skywin Aeronautics for services, partnerships, or general inquiries.</p>
              </div>
              <div className="space-y-4 text-sm text-[color:var(--muted)]">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Email</p>
                  <p className="dark:text-white">naol1000zedu@gmail.com</p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Location</p>
                  <p className="dark:text-white">Skywin Aeronautics, 1200 Aero Park Drive, Denver, CO</p>
                </div>
              </div>
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
