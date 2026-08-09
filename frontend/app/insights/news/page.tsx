export const revalidate = 0;

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from "../../components/Container";
import Section from "../../components/Section";
import { getPostsByType } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

function NewsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
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
  );
}

async function NewsGrid() {
  const posts = await getPostsByType(ContentType.NEWS);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--muted)]">No news articles available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post._id}
          href={`/insights/${post._id}`}
          className="group block overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="aspect-[16/9] overflow-hidden">
            <Image
              src={post.coverImage || '/drone.jpg'}
              alt={post.title}
              width={600}
              height={338}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          <div className="p-6">
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                NEWS
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
  );
}

export default function NewsPage() {
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
          <Suspense fallback={<NewsSkeleton />}>
            <NewsGrid />
          </Suspense>
        </Section>
      </Container>
    </main>
  );
}
