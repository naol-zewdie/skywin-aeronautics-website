"use client";

import dynamic from "next/dynamic";

// ssr:false must live inside a Client Component (Next.js 16 App Router rule).

export const FluidBackground = dynamic(
  () => import("./FluidBackground"),
  { ssr: false }
);

export const LoadingScreen = dynamic(
  () => import("./LoadingScreen"),
  { ssr: false }
);

export const DroneGlobe = dynamic(
  () => import("./DroneGlobe"),
  { ssr: false }
);

export const ScrollProgress = dynamic(
  () => import("./ScrollProgress"),
  { ssr: false }
);

export const StatsTicker = dynamic(
  () => import("./StatsTicker"),
  { ssr: false }
);

export const HeroInteractive = dynamic(
  () => import("./HeroInteractive"),
  { ssr: false }
);

export const AboutScene = dynamic(
  () => import("./AboutScene"),
  { ssr: false }
);

export const ServicesScene = dynamic(
  () => import("./ServicesScene"),
  { ssr: false }
);

export const ProductsScene = dynamic(
  () => import("./ProductsScene"),
  { ssr: false }
);

export const ContactScene = dynamic(
  () => import("./ContactScene"),
  { ssr: false }
);

export const CareersScene = dynamic(
  () => import("./CareersScene"),
  { ssr: false }
);

export const InsightsScene = dynamic(
  () => import("./InsightsScene"),
  { ssr: false }
);

export const HeroVideoBackground = dynamic(
  () => import("./HeroVideoBackground"),
  { ssr: false }
);
