export const revalidate = 0;

import { Suspense } from 'react';
import Card from "../components/Card";
import Container from "../components/Container";
import Section from "../components/Section";
import { getCareers } from "../../lib/api";

async function CareersGrid() {
  const careers = await getCareers();

  if (careers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--muted)]">No career openings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {careers.map((career) => (
        <Card key={career.title} title={career.title} description={career.description} />
      ))}
    </div>
  );
}

function CareersSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-6 space-y-3">
          <div className="h-5 w-2/3 bg-[color:var(--muted)]/10 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
            <div className="h-3 w-4/5 bg-[color:var(--muted)]/10 rounded" />
            <div className="h-3 w-3/4 bg-[color:var(--muted)]/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CareersPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12" backgroundImage="/assets/Drone-1.jpg">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Careers</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Join a team that builds aerospace solutions with purpose.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-[color:var(--muted)]">
              At Skywin, we invest in people who value technical excellence, collaborative thinking, and long-term growth in aerospace engineering.
            </p>
          </div>
        </Section>

        <Section>
          <Suspense fallback={<CareersSkeleton />}>
            <CareersGrid />
          </Suspense>
        </Section>

        <Section>
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] p-10 shadow-sm">
            <h2 className="text-2xl font-semibold text-[color:var(--primary)]">Why join us?</h2>
            <ul className="mt-6 space-y-4 text-[color:var(--muted)]">
              <li>Meaningful aerospace work with clear accountability and strong planning.</li>
              <li>A supportive environment that values collaboration and continuous improvement.</li>
              <li>Opportunities to grow across engineering, program support, and technical leadership.</li>
            </ul>
          </div>
        </Section>
      </Container>
      
    </main>
  );
}
