import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "ghost" | "glow";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variants = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#23364F] to-[#45576D] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#23364F]/40 hover:from-[#45576D] hover:to-[#23364F] ring-2 ring-[#45576D]/20 ring-offset-2 ring-offset-[color:var(--background)]",
  ghost:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--accent)] bg-transparent px-6 py-3 text-sm font-semibold text-[color:var(--primary)] transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[#23364F]/10 hover:to-[#45576D]/10 hover:shadow-lg hover:shadow-[#45576D]/30 hover:border-[#23364F] hover:ring-2 hover:ring-[#23364F]/30 ring-offset-2 ring-offset-[color:var(--background)]",
  glow:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#23364F] via-[#2c4463] to-[#45576D] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(35,54,79,0.5)] hover:from-[#1a2b40] hover:to-[#3a5578] ring-2 ring-[#45576D]/30 ring-offset-2 ring-offset-[color:var(--background)] relative overflow-hidden",
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
        {variant === "glow" && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        )}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {variant === "glow" && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
      )}
      {children}
    </button>
  );
}
