'use client';

import { useState, useEffect } from 'react';
import Card from "../components/Card";
import Container from "../components/Container";
import Section from "../components/Section";
import { getCareers, FrontendCareer } from "../../lib/api";

// Smooth scroll to top function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

export default function CareersPage() {
  const [careers, setCareers] = useState<FrontendCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const data = await getCareers();
        setCareers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch careers:', err);
        setError('Failed to load careers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  if (loading) {
    return (
      <Section className="py-20">
        <Container>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)]"></div>
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[color:var(--primary)] mb-4">Error</h2>
            <p className="text-[color:var(--muted)] mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors"
            >
              Try Again
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Careers</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Join a team that builds aerospace solutions with purpose.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              At Skywin, we invest in people who value technical excellence, collaborative thinking, and long-term growth in aerospace engineering.
            </p>
          </div>
        </Section>

        <Section>
          <div className="grid gap-6 lg:grid-cols-3">
            {careers.map((career) => (
              <Card key={career.title} title={career.title} description={career.description} />
            ))}
          </div>
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
