import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variants = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[color:var(--accent)]/50 hover:from-[color:var(--accent)] hover:to-[color:var(--primary)] ring-2 ring-[color:var(--accent)]/20 ring-offset-2 ring-offset-[color:var(--background)]",
  ghost:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--accent)] bg-[color:var(--background)] px-6 py-3 text-sm font-semibold text-[color:var(--primary)] transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[color:var(--accent)]/10 hover:to-[color:var(--primary)]/10 hover:shadow-lg hover:shadow-[color:var(--accent)]/30 hover:border-[color:var(--primary)] hover:ring-2 hover:ring-[color:var(--accent)]/30 ring-offset-2 ring-offset-[color:var(--background)]",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
