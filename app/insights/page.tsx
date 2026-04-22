'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from "../components/Container";
import Section from "../components/Section";
import { getPosts, getPostsByType, FrontendPost } from "../../lib/api";
import { ContentType } from "../../lib/types";

export default function InsightsPage() {
  const [posts, setPosts] = useState<FrontendPost[]>([]);
  const [news, setNews] = useState<FrontendPost[]>([]);
  const [blogs, setBlogs] = useState<FrontendPost[]>([]);
  const [events, setEvents] = useState<FrontendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'blog' | 'event'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all posts and posts by type
        const [allPosts, newsPosts, blogPosts, eventPosts] = await Promise.all([
          getPosts({ status: true }),
          getPostsByType(ContentType.NEWS),
          getPostsByType(ContentType.BLOG),
          getPostsByType(ContentType.EVENT),
        ]);

        setPosts(allPosts);
        setNews(newsPosts);
        setBlogs(blogPosts);
        setEvents(eventPosts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDisplayPosts = () => {
    switch (activeTab) {
      case 'news':
        return news;
      case 'blog':
        return blogs;
      case 'event':
        return events;
      default:
        return posts;
    }
  };

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

  const displayPosts = getDisplayPosts();

  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Insights</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Stay informed with our latest insights and updates.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Explore our news, blog posts, and events to stay up-to-date with the latest developments in aerospace technology and drone innovation.
            </p>
          </div>
        </Section>

        {/* Tab Navigation */}
        <Section>
          <div className="border-b border-[color:var(--border)]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                    : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--primary)]'
                }`}
              >
                All Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'news'
                    ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                    : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--primary)]'
                }`}
              >
                News ({news.length})
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'blog'
                    ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                    : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--primary)]'
                }`}
              >
                Blog ({blogs.length})
              </button>
              <button
                onClick={() => setActiveTab('event')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'event'
                    ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                    : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--primary)]'
                }`}
              >
                Events ({events.length})
              </button>
            </nav>
          </div>
        </Section>

        {/* Posts Grid */}
        <Section>
          {displayPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--muted)]">No posts found for this category.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map((post) => (
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
                    {/* Type Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.type === ContentType.NEWS
                          ? 'bg-blue-100 text-blue-800'
                          : post.type === ContentType.BLOG
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {post.type.toUpperCase()}
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
                            className="inline-block rounded bg-[color:var(--muted)]/10 px-2 py-1 text-xs text-[color:var(--muted)]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="inline-block rounded bg-[color:var(--muted)]/10 px-2 py-1 text-xs text-[color:var(--muted)]">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Event Date for Events */}
                    {post.type === ContentType.EVENT && post.eventDate && (
                      <div className="mt-3 flex items-center text-sm text-[color:var(--accent)]">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(post.eventDate)}
                        {post.eventLocation && (
                          <>
                            <span className="mx-2">·</span>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {post.eventLocation}
                          </>
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
