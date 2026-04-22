'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPostsByType, FrontendPost } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

export default function EventsPage() {
  const [posts, setPosts] = useState<FrontendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getPostsByType(ContentType.EVENT);
        // Sort events by date (upcoming first)
        const sortedEvents = data.sort((a, b) => {
          const dateA = new Date(a.eventDate || a.createdAt);
          const dateB = new Date(b.eventDate || b.createdAt);
          return dateA.getTime() - dateB.getTime();
        });
        setPosts(sortedEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEventDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (eventDate: string | Date) => {
    return new Date(eventDate) >= new Date();
  };

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
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--muted)]">No events scheduled at the moment.</p>
            </div>
          ) : (
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
                        {/* Event Date Card */}
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
                        
                        {/* Content */}
                        <div className="md:w-2/3">
                          {/* Event Badge */}
                          <div className="mb-3">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                              EVENT
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-semibold text-[color:var(--primary)] mb-3 line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-[color:var(--muted)] mb-4 line-clamp-3">
                            {post.excerpt || post.content.substring(0, 200) + '...'}
                          </p>

                          {/* Event Details */}
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

                          {/* Meta Information */}
                          <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
                            <div className="flex items-center space-x-2">
                              <span>By {post.author}</span>
                              <span>·</span>
                              <span>{post.views || 0} views</span>
                            </div>
                          </div>

                          {/* Tags */}
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
          )}
        </Section>
      </Container>
    </main>
  );
}
