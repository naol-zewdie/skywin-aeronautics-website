"use client";

import React, { Component, useState, useEffect, useRef, ReactNode } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

/* ═══════════════════════════════════════════════════════════════
   SAFE CANVAS & WEBGL ERROR INTERCEPTOR
   • Pre-flight WebGL check before mounting Canvas
   • Catches WebGL context initialization crashes
   • Suppresses unhandled promise rejections from Three.js renderer
   • Handles webglcontextlost gracefully
   • Renders smooth fallback UI if WebGL is unavailable or blocked
   • Automatically pauses rendering when scrolled off-screen
     (IntersectionObserver → frameloop="never" when not visible)
     This prevents all 6+ background scenes from burning GPU/CPU
     simultaneously. Pausing is opt-out via pauseWhenOffscreen={false}.
═══════════════════════════════════════════════════════════════ */

// Check if WebGL is currently supported and capable of context creation
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null);
    // NOTE: Do NOT call ext.loseContext() here — it corrupts the driver's
    // context pool on certain GPUs and causes subsequent real canvases to fail.
    return !!gl;
  } catch {
    return false;
  }
}

// Global unhandled rejection interceptor for WebGL renderer failures
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const msg = String(e?.reason?.message || e?.reason || "");
    if (
      msg.includes("THREE.WebGLRenderer") ||
      msg.includes("Error creating WebGL context") ||
      msg.includes("WebGL context could not be created") ||
      msg.includes("BindToCurrentSequence") ||
      msg.includes("context loss") ||
      msg.includes("WEBGL_lose_context")
    ) {
      // Prevent Next.js development crash overlay
      e.preventDefault();
      console.warn("[WebGL] Intercepted WebGL context creation error:", msg);
    }
  });
}

// React Error Boundary specifically for WebGL Canvas rendering
interface BoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[WebGL] WebGL error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export interface SafeCanvasProps extends CanvasProps {
  fallback?: ReactNode;
  /**
   * When true (default), an IntersectionObserver watches the canvas container
   * and sets frameloop="never" while it is not intersecting the viewport,
   * and restores the caller's frameloop (or "always") when it re-enters.
   *
   * Set to false for fixed-position canvases that are always visible
   * (e.g. FluidBackground), or when the caller manages frameloop externally.
   *
   * Note: position:fixed elements always intersect the viewport, so they
   * are unaffected even if pauseWhenOffscreen remains true.
   */
  pauseWhenOffscreen?: boolean;
}

export default function SafeCanvas({
  children,
  fallback,
  gl,
  onCreated,
  frameloop,
  style,
  pauseWhenOffscreen = true,
  ...props
}: SafeCanvasProps) {
  const [canRender, setCanRender] = useState(false);
  // Start as visible so there is no flash of "never" on first mount
  const [isVisible, setIsVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pre-flight WebGL support check (runs once on mount)
  useEffect(() => {
    if (isWebGLSupported()) {
      setCanRender(true);
    }
  }, []);

  // Intersection Observer: pause rendering while off-screen
  useEffect(() => {
    if (!pauseWhenOffscreen) return;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        // Fire as soon as even 1px enters/leaves the viewport
        threshold: 0,
        // No rootMargin — we want to pause the instant it's out of view,
        // not before. A small positive margin (e.g. "200px") could be used
        // to pre-warm the render loop before it scrolls into view.
        rootMargin: "0px",
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [pauseWhenOffscreen]);

  /*
   * Effective frameloop:
   *  - If pausing is disabled → use whatever the caller passed (or undefined)
   *  - If visible            → use caller's frameloop (default: "always")
   *  - If off-screen         → "never"  ← GPU/CPU pause
   */
  const effectiveFrameloop: CanvasProps["frameloop"] = pauseWhenOffscreen
    ? isVisible
      ? (frameloop ?? "always")
      : "never"
    : frameloop;

  /*
   * Wrapper div:
   * - Fills the parent completely (position-agnostic).
   * - Is the IntersectionObserver target so we observe the actual
   *   canvas slot in the document, not an off-screen element.
   * - When not yet renderable, still renders so the observer can
   *   correctly measure visibility (and the fallback shows inside it).
   * - We also forward the caller's style here so sizing/background
   *   props (e.g. FluidBackground's width/height, DroneGlobe's
   *   background:transparent) are correctly applied to the container.
   */
  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    // Ensure the wrapper doesn't introduce unwanted overflow/scroll
    overflow: "hidden",
    // Merge caller-supplied style (e.g. background, explicit dimensions)
    ...style,
  };

  if (!canRender) {
    return (
      <div ref={wrapperRef} style={wrapperStyle}>
        {fallback ?? null}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <WebGLErrorBoundary fallback={fallback}>
        <Canvas
          {...props}
          style={{ width: "100%", height: "100%" }}
          frameloop={effectiveFrameloop}
          gl={{
            // Defaults — caller-supplied gl props take precedence (spread last)
            antialias: true,
            alpha: true,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
            // Caller props override the defaults above
            ...gl,
          }}
          onCreated={(state) => {
            try {
              const dom = state.gl.domElement;
              dom.addEventListener(
                "webglcontextlost",
                (e) => {
                  e.preventDefault();
                  console.warn("[WebGL] WebGL context lost on canvas");
                },
                false
              );
            } catch (err) {
              console.warn("[WebGL] Failed to attach context loss listener:", err);
            }
            if (onCreated) {
              onCreated(state);
            }
          }}
        >
          {children}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
