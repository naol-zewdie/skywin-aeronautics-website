'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FrontendPost } from '../../lib/api';
import { ContentType } from '../../lib/types';

type Props = {
  allPosts: FrontendPost[];
  news: FrontendPost[];
  blogs: FrontendPost[];
  events: FrontendPost[];
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function PostGridTabs({ allPosts, news, blogs, events }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'blog' | 'event'>('all');

  const getDisplayPosts = () => {
    switch (activeTab) {
      case 'news': return news;
      case 'blog': return blogs;
      case 'event': return events;
      default: return allPosts;
    }
  };

  const displayPosts = getDisplayPosts();

  return (
    <>
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
            All Posts ({allPosts.length})
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
              <div className="aspect-[16/9] overflow-hidden">
                <Image
                  src={post.coverImage || '/drone.jpg'}
                  alt={post.title}
                  width={400}
                  height={225}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono ${
                    post.type === ContentType.NEWS
                      ? 'bg-[#23364F]/50 text-[#8fa3bf] border border-[#45576D]/40'
                      : post.type === ContentType.BLOG
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/10 text-white/90 border border-white/20'
                  }`}>
                    {post.type.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2 line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-[color:var(--muted)] mb-4 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>

                <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                  <div className="flex items-center space-x-2">
                    <span>By {post.author}</span>
                    <span>&middot;</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.views && (
                    <span>{post.views} views</span>
                  )}
                </div>

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

                {post.type === ContentType.EVENT && post.eventDate && (
                  <div className="mt-3 flex items-center text-sm text-[color:var(--accent)]">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(post.eventDate)}
                    {post.eventLocation && (
                      <>
                        <span className="mx-2">&middot;</span>
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
    </>
  );
}
