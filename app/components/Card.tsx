import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}>;

const cardStyles = {
  default:
    "rounded-3xl border border-[color:var(--border)] bg-[color:var(--background-alt)] p-8 shadow-sm transition hover:shadow-md",
  outline:
    "rounded-3xl border border-[color:var(--accent)] bg-[color:var(--background-alt)] p-8 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-[color:var(--accent)]/80 hover:border-transparent text-[color:var(--foreground)]",
};

export default function Card({
  title,
  description,
  footer,
  children,
  variant = "default",
  className = "",
}: CardProps) {
  return (
    <article className={`${cardStyles[variant]} ${className}`.trim()}>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[color:var(--primary)]">
          {title}
        </h3>
        <p className="text-sm leading-6 text-[color:var(--muted)]">
          {description}
        </p>
        {children}
      </div>
      {footer ? <div className="mt-6 text-sm font-medium text-[color:var(--muted)]">{footer}</div> : null}
    </article>
  );
}
