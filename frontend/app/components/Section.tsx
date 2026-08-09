import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{ className?: string; backgroundImage?: string }>;

export default function Section({ children, className = "", backgroundImage }: SectionProps) {
  return (
    <section className={`relative overflow-hidden py-10 sm:py-14 ${className}`}>
      <div className="absolute inset-0" style={{background: 'var(--gradient-mesh)'}} />
      {backgroundImage && (
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--background)]/50 via-transparent to-[color:var(--background)]/30" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {children}
      </div>
    </section>
  );
}
