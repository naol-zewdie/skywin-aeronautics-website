import type { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
  return (
    <div className="relative">
      <div className="absolute inset-0" style={{background: 'var(--gradient-mesh)'}} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color:var(--background)]/10 to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-4">
        {children}
      </div>
    </div>
  );
}
