'use client';

import { useRef, useEffect, useState } from 'react';

export default function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion safely inside useEffect (always client-side)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const video = videoRef.current;
    if (!video || mq.matches) return;

    // ── Critical fix: React's `muted` JSX prop does NOT reliably set the DOM
    // property in all browsers. Autoplay is silently blocked unless the DOM node's
    // .muted property is explicitly true. We set it here as the definitive fix.
    video.muted = true;

    // Trigger playback — will succeed because video.muted is now true above.
    video.play().catch(() => {
      // Blocked by a very restrictive browser policy; poster image stays visible.
    });
  }, []);

  // Don't mount the video element if user prefers reduced motion
  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* ── Video — always visible, no opacity gate ── */}
      <video
        ref={videoRef}
        src="/assets/vtol.mp4"
        poster="/assets/vtol_bg.JPG"
        muted          /* React virtual-DOM hint — actual muting enforced in useEffect */
        autoPlay
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'brightness(0.65) saturate(0.75)',
        }}
      />

      {/* ── Gradient overlays ── */}

      {/* Top → bottom dark veil (text readability) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(3,5,8,0.30) 0%, rgba(3,5,8,0.10) 40%, rgba(3,5,8,0.35) 80%, rgba(3,5,8,0.80) 100%)',
        }}
      />

      {/* Left edge dark fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(3,5,8,0.40) 0%, rgba(3,5,8,0.15) 40%, transparent 70%)',
        }}
      />

      {/* Navy colour cast matching brand #23364F / #45576D */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 65% 40%, rgba(35,54,79,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Bottom vignette — seamless blend into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-56"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(3,5,8,0.85) 85%, #030508 100%)',
        }}
      />
    </div>
  );
}
