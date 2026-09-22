"use client";

// Hero pill buttons — needs "use client" for hover interactivity.
// page.tsx is a Server Component so inline event handlers are not allowed there.

import Link from "next/link";

export function PrimaryPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hero-pill-primary">
      {children}
    </Link>
  );
}

export function GhostPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hero-pill-ghost">
      {children}
    </Link>
  );
}
