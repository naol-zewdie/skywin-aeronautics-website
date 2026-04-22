'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPostsByType, FrontendPost } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

export default function NewsPage() {
  const [posts, setPosts] = useState<FrontendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getPostsByType(ContentType.NEWS);
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">News</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Latest news and updates from Skywin Aeronautics.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Stay informed about our latest developments, partnerships, and innovations in aerospace technology.
            </p>
          </div>
        </Section>

        <Section>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--muted)]">No news articles available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/insights/${post._id}`}
                  className="group block overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.coverImage || '/drone.jpg'}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* News Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        NEWS
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2 line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-[color:var(--muted)] mb-4 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                      <div className="flex items-center space-x-2">
                        <span>By {post.author}</span>
                        <span>·</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      {post.views && (
                        <span>{post.views} views</span>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </Container>
    </main>
  );
}
