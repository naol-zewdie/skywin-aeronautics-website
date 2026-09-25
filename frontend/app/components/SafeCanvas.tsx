"use client";

import React, { Component, useState, useEffect, ReactNode } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

/* ═══════════════════════════════════════════════════════════════
   SAFE CANVAS & WEBGL ERROR INTERCEPTOR
   • Pre-flight WebGL check before mounting Canvas
   • Catches WebGL context initialization crashes
   • Suppresses unhandled promise rejections from Three.js renderer
   • Handles webglcontextlost gracefully
   • Renders smooth fallback UI if WebGL is unavailable or blocked
═══════════════════════════════════════════════════════════════ */

// Check if WebGL is currently supported and capable of context creation
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null);
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) {
      ext.loseContext();
    }
    return true;
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
}

export default function SafeCanvas({
  children,
  fallback,
  gl,
  onCreated,
  ...props
}: SafeCanvasProps) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (isWebGLSupported()) {
      setCanRender(true);
    }
  }, []);

  if (!canRender) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <Canvas
        {...props}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
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
  );
}
