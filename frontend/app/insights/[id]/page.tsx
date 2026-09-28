export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getPost } from "../../../lib/api";
import { ContentType } from "../../../lib/types";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function calculateReadTime(content: string = ""): string {
  const plainText = content.replace(/<[^>]*>?/gm, "").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} MIN READ`;
}

function formatDateShort(dateString?: string | Date): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function formatFullEventDate(dateString?: string | Date): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Dispatch Not Found | Skywin Aeronautics",
    };
  }

  return {
    title: `${post.title} | Skywin Aeronautics`,
    description:
      post.excerpt || post.content.replace(/<[^>]*>?/gm, "").slice(0, 160),
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const isHtml = /<(p|div|h[1-6]|ul|ol|li|table|strong|em|br)/i.test(post.content);
  const displayImage = post.coverImage || "/drone.jpg";
  const primaryTag =
    post.tags && post.tags.length > 0
      ? post.tags[0].toUpperCase()
      : post.type.toUpperCase();
  const readTime = calculateReadTime(post.content);
  const formattedDate = formatDateShort(
    post.type === ContentType.EVENT && post.eventDate
      ? post.eventDate
      : post.createdAt
  );

  const backHref =
    post.type === ContentType.BLOG
      ? "/insights/blog"
      : post.type === ContentType.NEWS
      ? "/insights/news"
      : post.type === ContentType.EVENT
      ? "/insights/events"
      : "/insights";

  const backLabel =
    post.type === ContentType.BLOG
      ? "BACK TO BLOG"
      : post.type === ContentType.NEWS
      ? "BACK TO NEWS"
      : post.type === ContentType.EVENT
      ? "BACK TO EVENTS"
      : "BACK TO INSIGHTS";

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden pt-24 sm:pt-32 pb-24">
      {/* ── Dot Matrix Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* ── Ambient Radial Color Glows ── */}
      <div
        className="absolute -top-32 left-1/3 w-[700px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.30) 0%, rgba(35, 54, 79, 0.15) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -right-40 w-[600px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-15 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(69, 87, 109, 0.35) 0%, rgba(35, 54, 79, 0.2) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-10 sm:space-y-12">
        {/* ══════════════════════════════════════════════════════
            1. BREADCRUMBS & NAVIGATION (Matching Image 3 Top)
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/[0.03] transition-all duration-200 self-start"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>{backLabel}</span>
          </Link>

          {/* Breadcrumb line matching Image 3: BLOG • AI • TITLE */}
          <div className="text-[11px] font-mono tracking-widest text-white/40 uppercase overflow-hidden text-ellipsis whitespace-nowrap">
            <span>{post.type}</span>
            <span className="mx-2 text-white/20">•</span>
            <span>{primaryTag}</span>
            <span className="mx-2 text-white/20">•</span>
            <span className="text-white/60">{post.title}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. HERO CARD CONTAINER (Matching Image 3)
        ══════════════════════════════════════════════════════ */}
        <section
          className="relative rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-10 md:p-12 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between"
          style={{
            background: "rgba(11, 17, 28, 0.88)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 20px 60px -10px rgba(0,0,0,0.8), 0 0 30px rgba(69,87,109,0.15)",
          }}
        >
          {/* Background Blueprint / Cover Graphic Overlay (Matching Image 3 right-side graphic) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
            <Image
              src={displayImage}
              alt={post.title}
              fill
              priority
              className="object-cover object-center filter grayscale contrast-125"
            />
            {/* Pink / Cyan schematic tint gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 75% 40%, rgba(244, 63, 94, 0.15) 0%, rgba(14, 23, 42, 0.85) 60%, rgba(11, 17, 28, 0.98) 100%)",
              }}
            />
            {/* Tech grid texture overlay */}
            <div className="absolute inset-0 tech-grid opacity-25" />
          </div>

          {/* Top Row: Pill Tag + Read Time & Organization (Matching Image 3) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Left Pill: ● TYPE · DATE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-white uppercase tracking-wider">
                {post.type}
              </span>
              {formattedDate && <span className="text-white/30">·</span>}
              {formattedDate && (
                <span className="text-white/60 tracking-wider">
                  {formattedDate}
                </span>
              )}
            </div>

            {/* Right Tag: Read Time & Author / Skywin */}
            <div className="text-white/50 tracking-widest uppercase text-[11px]">
              <span>
                {post.type === ContentType.EVENT && post.eventDate
                  ? "EVENT"
                  : readTime}
              </span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white/80 font-semibold">
                {(post.author || "SKYWIN AERONAUTICS").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Massive Display Title (Matching Image 3 Headline Style) */}
          <div className="relative z-10 my-8 sm:my-12 max-w-4xl">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.06] tracking-tight drop-shadow-md"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h1>
          </div>

          {/* Floating Excerpt Callout Box (Matching Image 3 Bottom Right Card) */}
          <div className="relative z-10 flex justify-end">
            <div
              className="w-full sm:max-w-lg rounded-2xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-3"
              style={{
                background: "rgba(7, 13, 24, 0.92)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#6a7e98] uppercase tracking-widest">
                <span>[ EXECUTIVE BRIEF ]</span>
                {post.views !== undefined && post.views > 0 && (
                  <span>{post.views.toLocaleString()} VIEWS</span>
                )}
              </div>

              <p className="text-xs sm:text-[13px] leading-relaxed text-white/80 font-mono">
                {post.excerpt ||
                  post.content.replace(/<[^>]*>?/gm, "").substring(0, 180) + "..."}
              </p>

              {/* Event Specific Location & Date Callout */}
              {post.type === ContentType.EVENT && (
                <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs font-mono text-sky-400">
                  {post.eventDate && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatFullEventDate(post.eventDate)}</span>
                    </div>
                  )}
                  {post.eventLocation && (
                    <div className="flex items-center gap-2 text-white/70">
                      <span>📍</span>
                      <span>{post.eventLocation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            3. POST BODY CONTENT & TYPOGRAPHY (Matching Image 4)
        ══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto pt-6 pb-12 space-y-12">
          {/* Main Sanitized Article Body */}
          <article className="text-sm sm:text-base leading-relaxed text-white/75 space-y-6">
            {isHtml ? (
              <div
                className="prose prose-invert max-w-none text-white/75 text-sm sm:text-base leading-relaxed 
                  [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:font-display [&_h1]:tracking-tight
                  [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:tracking-tight
                  [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-semibold [&_h3]:text-[#8fa3bf] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display
                  [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:font-mono sm:[&_p]:font-sans
                  [&_strong]:text-white [&_strong]:font-bold
                  [&_a]:text-white [&_a]:underline [&_a]:decoration-[#6a7e98]/50 [&_a:hover]:text-[#8fa3bf] [&_a]:transition-colors
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:my-4
                  [&_li]:text-white/75 [&_li]:font-mono sm:[&_li]:font-sans
                  [&_blockquote]:border-l-2 [&_blockquote]:border-[#6a7e98] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/80 [&_blockquote]:my-6
                  [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
              />
            ) : (
              <div className="whitespace-pre-line font-mono sm:font-sans text-sm sm:text-base leading-relaxed space-y-4">
                {post.content}
              </div>
            )}
          </article>

          {/* Tags List */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest mr-2">
                TAGS:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-[#8fa3bf] bg-white/[0.04] border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Signature & Dispatch Metadata */}
          <div
            className="p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            style={{
              background: "rgba(11, 17, 28, 0.7)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#6a7e98]">
                DISPATCH BY
              </p>
              <p
                className="text-base sm:text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {post.author || "Skywin Aeronautics Engineering Group"}
              </p>
              <p className="text-xs font-mono text-white/40">
                Addis Ababa, Ethiopia · Sovereign Aerospace Manufacturing
              </p>
            </div>

            <Link
              href={backHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-white border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/10 transition-all duration-200 self-start sm:self-auto cursor-pointer"
            >
              <span>← {backLabel}</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}