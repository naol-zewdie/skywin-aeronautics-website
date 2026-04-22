'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPostsByType, FrontendPost } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<FrontendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await getPostsByType(ContentType.BLOG);
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
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
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Blog</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Insights and perspectives on aerospace innovation.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Explore our expert articles on drone technology, aerospace engineering, and the future of aviation.
            </p>
          </div>
        </Section>

        <Section>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--muted)]">No blog posts available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/insights/${post._id}`}
                  className="group block"
                >
                  <div className="flex flex-col md:flex-row gap-8 p-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="md:w-1/3 aspect-[16/9] overflow-hidden rounded-xl">
                      <img
                        src={post.coverImage || '/drone.jpg'}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="md:w-2/3 flex flex-col justify-center">
                      {/* Blog Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          BLOG
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

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
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
                          {post.tags.slice(0, 4).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block rounded bg-green-50 px-2 py-1 text-xs text-green-700"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 4 && (
                            <span className="inline-block rounded bg-green-50 px-2 py-1 text-xs text-green-700">
                              +{post.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
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
