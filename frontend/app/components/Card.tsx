import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
  image?: string;
}>;

const cardStyles = {
  default:
    "rounded-3xl border border-[color:var(--border)] bg-[color:var(--background-alt)] p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 hover:-translate-y-2 hover:animate-slide-up",
  outline:
    "rounded-3xl border border-[color:var(--accent)] bg-[color:var(--background-alt)] p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 hover:-translate-y-2 hover:animate-slide-up hover:border-transparent text-[color:var(--foreground)]",
};

export default function Card({
  title,
  description,
  footer,
  children,
  variant = "default",
  className = "",
  image,
}: CardProps) {
  return (
    <article className={`${cardStyles[variant]} ${className}`.trim()}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Text Content - Left Side */}
        <div className="flex-1 space-y-4 text-left">
          <h3 className="text-xl font-semibold text-[color:var(--primary)]">
            {title}
          </h3>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {description}
          </p>
          {children}
        </div>
        
        {/* Image Container - Right Side */}
        {image && (
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
        )}
      </div>
      {footer ? <div className="mt-6 text-sm font-medium text-[color:var(--muted)]">{footer}</div> : null}
    </article>
  );
}
