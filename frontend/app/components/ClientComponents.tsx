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
