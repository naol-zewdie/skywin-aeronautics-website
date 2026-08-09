export const revalidate = 0;

import { Suspense } from 'react';
import Container from "../components/Container";
import Section from "../components/Section";
import { getPosts, getPostsByType } from "../../lib/api";
import { ContentType } from "../../lib/types";
import PostGridTabs from "./PostGridTabs";

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-5 w-24 bg-[color:var(--muted)]/10 rounded" />
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] overflow-hidden">
            <div className="aspect-[16/9] bg-[color:var(--muted)]/10" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-16 bg-[color:var(--muted)]/10 rounded-full" />
              <div className="h-5 w-3/4 bg-[color:var(--muted)]/10 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
                <div className="h-3 w-2/3 bg-[color:var(--muted)]/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function InsightsContent() {
  const [allPosts, news, blogs, events] = await Promise.all([
    getPosts({ status: true }),
    getPostsByType(ContentType.NEWS),
    getPostsByType(ContentType.BLOG),
    getPostsByType(ContentType.EVENT),
  ]);

  return <PostGridTabs allPosts={allPosts} news={news} blogs={blogs} events={events} />;
}

export default function InsightsPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Insights</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Stay informed with our latest insights and updates.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-[color:var(--muted)]">
              Explore our news, blog posts, and events to stay up-to-date with the latest developments in aerospace technology and drone innovation.
            </p>
          </div>
        </Section>

        <Section>
          <Suspense fallback={<InsightsSkeleton />}>
            <InsightsContent />
          </Suspense>
        </Section>
      </Container>
    </main>
  );
}
