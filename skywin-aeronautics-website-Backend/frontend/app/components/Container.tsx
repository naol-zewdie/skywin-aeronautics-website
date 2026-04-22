import type { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-600/20 to-transparent opacity-30" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-4">
        {children}
      </div>
    </div>
  );
}
