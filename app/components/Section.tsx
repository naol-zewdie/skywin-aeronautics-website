import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{ className?: string }>;

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <section className={`relative overflow-hidden py-10 sm:py-14 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-600/20 to-transparent opacity-20" />
      <div className="relative mx-auto w-full max-w-7xl px-6">
        {children}
      </div>
    </section>
  );
}
