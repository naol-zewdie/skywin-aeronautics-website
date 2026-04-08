import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{ className?: string }>;

export default function Section({ children, className = "" }: SectionProps) {
  return <section className={`py-10 sm:py-14 ${className}`}>{children}</section>;
}
