export const revalidate = 0;

import { Suspense } from 'react';
import Card from "../components/Card";
import Container from "../components/Container";
import Section from "../components/Section";
import { getServices } from "../../lib/api";

async function ServicesGrid() {
  const services = await getServices();

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--muted)]">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service, index) => (
        <Card
          key={index}
          title={service.title}
          description={service.description}
          image={service.image}
        />
      ))}
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] overflow-hidden">
          <div className="aspect-[16/9] bg-[color:var(--muted)]/10" />
          <div className="p-6 space-y-3">
            <div className="h-5 w-2/3 bg-[color:var(--muted)]/10 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
              <div className="h-3 w-5/6 bg-[color:var(--muted)]/10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12" backgroundImage="/assets/futuristic-drone-technology-abstract-digital-600nw-2416483185.webp">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">What we do</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Comprehensive aerospace services built for growth.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-[color:var(--muted)]">
              Our service offerings are designed to support aerospace programs at every stage, from early concept through production and delivery.
            </p>
          </div>
        </Section>

        <Section>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesGrid />
          </Suspense>
        </Section>
      </Container>
      
    </main>
  );
}
