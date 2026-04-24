'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPost, FrontendPost } from "../../../lib/api";
import { ContentType } from "../../../lib/types";
import DOMPurify from 'isomorphic-dompurify';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<FrontendPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const postData = await getPost(params.id as string);
        
        if (!postData) {
          setError('Post not found');
          return;
        }
        
        setPost(postData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

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

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.NEWS:
        return 'bg-blue-100 text-blue-800';
      case ContentType.BLOG:
        return 'bg-green-100 text-green-800';
      case ContentType.EVENT:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackLink = (type: ContentType) => {
    switch (type) {
      case ContentType.NEWS:
        return '/insights/news';
      case ContentType.BLOG:
        return '/insights/blog';
      case ContentType.EVENT:
        return '/insights/events';
      default:
        return '/insights';
    }
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

  if (error || !post) {
    return (
      <Section className="py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[color:var(--primary)] mb-4">
              {error || 'Post not found'}
            </h2>
            <p className="text-[color:var(--muted)] mb-8">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/insights"
              className="inline-flex items-center px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors"
            >
              Back to Insights
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <Container>
        <Section className={`${post.coverImage ? '-mt-16' : 'pt-12'}`}>
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href={getBackLink(post.type)}
              className="inline-flex items-center text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Back to {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </Link>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              {/* Type Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(post.type)}`}>
                  {post.type.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--primary)] mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--muted)]">
                <div className="flex items-center">
                  <span>By {post.author}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.createdAt)}
                </div>
                {post.views && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {post.views} views
                  </div>
                )}
              </div>

              {/* Event Specific Information */}
              {post.type === ContentType.EVENT && (
                <div className="mt-4 p-4 rounded-lg bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {post.eventDate && (
                      <div className="flex items-center text-[color:var(--accent)]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatEventDate(post.eventDate)}
                      </div>
                    )}
                    {post.eventLocation && (
                      <div className="flex items-center text-[color:var(--accent)]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.eventLocation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block rounded-full bg-[color:var(--muted)]/10 px-3 py-1 text-sm text-[color:var(--muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-[color:var(--foreground)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-[color:var(--border)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2">Share this article</h3>
                  <p className="text-sm text-[color:var(--muted)]">
                    Help spread the word about this {post.type}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
