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
        <Section className="pt-12" backgroundImage="/assets/Drone-1.jpg">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Contact</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Connect with our aerospace team.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-[color:var(--muted)]">
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
                  <p className="text-[color:var(--foreground)]">naol1000zedu@gmail.com</p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Location</p>
                  <p className="text-[color:var(--foreground)]">Skywin Aeronautics, 1200 Aero Park Drive, Denver, CO</p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </Container>
      
    </main>
  );
}
