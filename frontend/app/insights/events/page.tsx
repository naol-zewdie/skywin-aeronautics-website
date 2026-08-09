export const revalidate = 0;

import { Suspense } from 'react';
import Link from 'next/link';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPostsByType } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

function EventsSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col md:flex-row gap-8 p-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]">
          <div className="md:w-48 flex-shrink-0">
            <div className="rounded-xl p-4 h-24 bg-[color:var(--muted)]/10" />
          </div>
          <div className="md:w-2/3 space-y-3">
            <div className="h-4 w-16 bg-[color:var(--muted)]/10 rounded-full" />
            <div className="h-6 w-3/4 bg-[color:var(--muted)]/10 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
              <div className="h-3 w-4/5 bg-[color:var(--muted)]/10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function EventsGrid() {
  const data = await getPostsByType(ContentType.EVENT);
  const posts = data.sort((a, b) => {
    const dateA = new Date(a.eventDate || a.createdAt);
    const dateB = new Date(b.eventDate || b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });



  const formatEventDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (eventDate: string | Date) => {
    return new Date(eventDate) >= new Date();
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--muted)]">No events scheduled at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => {
        const upcoming = post.eventDate && isUpcoming(post.eventDate);
        
        return (
          <Link
            key={post._id}
            href={`/insights/${post._id}`}
            className="group block"
          >
            <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              upcoming 
                ? 'border-[color:var(--accent)] bg-gradient-to-r from-[color:var(--background)] to-[color:var(--accent)]/5' 
                : 'border-[color:var(--border)] bg-[color:var(--background)]'
            }`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-48 flex-shrink-0">
                  <div className={`rounded-xl p-4 text-center ${
                    upcoming 
                      ? 'bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] text-white' 
                      : 'bg-[color:var(--muted)]/10 text-[color:var(--muted)]'
                  }`}>
                    {post.eventDate ? (
                      <>
                        <div className="text-2xl font-bold">
                          {new Date(post.eventDate).getDate()}
                        </div>
                        <div className="text-sm">
                          {new Date(post.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xs mt-1">
                          {new Date(post.eventDate).getFullYear()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {new Date(post.createdAt).getDate()}
                        </div>
                        <div className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xs mt-1">
                          {new Date(post.createdAt).getFullYear()}
                        </div>
                      </>
                    )}
                  </div>
                  {upcoming && (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[color:var(--accent)] text-white">
                        UPCOMING
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="md:w-2/3">
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                      EVENT
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[color:var(--primary)] mb-3 line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-[color:var(--muted)] mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 200) + '...'}
                  </p>

                  <div className="space-y-2 mb-4">
                    {post.eventDate && (
                      <div className="flex items-center text-sm text-[color:var(--accent)]">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatEventDate(post.eventDate)}
                      </div>
                    )}
                    {post.eventLocation && (
                      <div className="flex items-center text-sm text-[color:var(--muted)]">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.eventLocation}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
                    <div className="flex items-center space-x-2">
                      <span>By {post.author}</span>
                      <span>&middot;</span>
                      <span>{post.views || 0} views</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block rounded bg-purple-50 px-2 py-1 text-xs text-purple-700"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="inline-block rounded bg-purple-50 px-2 py-1 text-xs text-purple-700">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function EventsPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Events</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Join us at our upcoming events and conferences.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Connect with us at expos, conferences, and workshops to explore the latest in aerospace technology and drone innovation.
            </p>
          </div>
        </Section>

        <Section>
          <Suspense fallback={<EventsSkeleton />}>
            <EventsGrid />
          </Suspense>
        </Section>
      </Container>
    </main>
  );
}
