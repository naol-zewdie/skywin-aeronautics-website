import type { PropsWithChildren } from "react";
import Image from "next/image";

type CardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: React.ReactNode;
  variant?: "default" | "outline" | "glass";
  className?: string;
  image?: string;
}>;

const cardStyles = {
  default:
    "rounded-2xl border border-[color:var(--border)] bg-[color:var(--background-alt)] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl",
  outline:
    "rounded-2xl border border-[color:var(--accent)] bg-[color:var(--background-alt)] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-transparent text-[color:var(--foreground)]",
  glass:
    "rounded-2xl glass p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(35,54,79,0.12)]",
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
    <article className={`${cardStyles[variant]} ${className} group relative overflow-hidden`.trim()}>
      {variant !== "glass" && (
        <div className="absolute -inset-1 bg-gradient-to-br from-[#23364F]/0 via-[#45576D]/0 to-[#23364F]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      )}
      <div className="relative flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4 text-left">
          <h3 className="text-xl font-semibold text-[color:var(--primary)]">
            {title}
          </h3>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {description}
          </p>
          {children}
        </div>
        
        {image && (
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg ring-1 ring-[color:var(--border)]">
              <Image
                src={image}
                alt={title}
                width={160}
                height={160}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="160px"
              />
            </div>
          </div>
        )}
      </div>
      {footer ? (
        <div className="mt-6 text-sm font-medium text-[color:var(--muted)] border-t border-[color:var(--border)] pt-4">
          {footer}
        </div>
      ) : null}
      {variant !== "glass" && (
        <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#23364F] to-[#45576D] transition-all duration-500 rounded-full" />
      )}
    </article>
  );
}
