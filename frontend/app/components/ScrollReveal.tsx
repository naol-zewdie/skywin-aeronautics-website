"use client";

import { useEffect, useRef, ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;       // ms
  threshold?: number;
  direction?: Direction;
  style?: React.CSSProperties;
}

const directionClass: Record<Direction, string> = {
  up:    "scroll-reveal",
  left:  "scroll-reveal-left",
  right: "scroll-reveal-right",
  scale: "scroll-reveal-scale",
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.08,
  direction = "up",
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already within viewport on initial load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 20 && rect.bottom > 0) {
      const timer = setTimeout(() => {
        el.classList.add("visible");
      }, delay);
      return () => clearTimeout(timer);
    }

    let timer: NodeJS.Timeout | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            el.classList.add("visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`${directionClass[direction]} ${className}`} style={style}>
      {children}
    </div>
  );
}

