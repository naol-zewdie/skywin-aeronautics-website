"use client";

import dynamic from "next/dynamic";

// Must live in a Client Component — ssr:false is not permitted in Server Components.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSceneWrapper() {
  return <HeroScene />;
}
