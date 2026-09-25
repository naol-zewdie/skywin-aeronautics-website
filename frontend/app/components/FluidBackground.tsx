"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SafeCanvas from "./SafeCanvas";

/* ═══════════════════════════════════════════════════════════════
   SKYWIN — LIVING NAVY AURORA BACKGROUND
   Full-screen GLSL shader:
   • Slow-breathing navy aurora / nebula clouds
   • Floating particle field (rendered via CSS on top)
   • Subtle dot-grid circuit overlay
   • Vignette to keep edges dark
   Dark and moody — alive but never distracting.
═══════════════════════════════════════════════════════════════ */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform float uDark;

  varying vec2 vUv;

  /* ── Value noise ──────────────────────────────────── */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1));
    float d = hash(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  /* ── Fractal Brownian Motion (fbm) ───────────────── */
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(100.0);
    mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = rot * p * 2.1 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

    float t = uTime * 0.12;   /* very slow drift */

    /* ── Near-black deep space base (subtle depth close to footer #000000) ── */
    vec3 col = vec3(0.003, 0.005, 0.008);

    /* ── Company Theme Colors ─────────────────────── */
    /* Primary: #23364F -> (0.137, 0.212, 0.310)      */
    /* Secondary: #45576D -> (0.271, 0.341, 0.427)    */
    vec3 cPrimary   = vec3(0.137, 0.212, 0.310);
    vec3 cSecondary = vec3(0.271, 0.341, 0.427);
    vec3 cDeep      = vec3(0.004, 0.007, 0.011);

    /* ── Aurora / nebula clouds ──────────────────── */
    vec2 q = vec2(fbm(p * 0.9 + t * vec2(0.6, 0.4)),
                  fbm(p * 0.9 + t * vec2(-0.5, 0.7)));
    vec2 r = vec2(fbm(p * 0.8 + 4.0 * q + vec2(1.7, 9.2) + t * 0.15),
                  fbm(p * 0.8 + 4.0 * q + vec2(8.3, 2.8) + t * 0.13));

    float f = fbm(p * 0.7 + 4.0 * r);

    /* Deep subtle near-black primary/secondary nebula glow */
    vec3 aurora = mix(
      cDeep,
      cPrimary * 0.25,
      clamp(f * f * 3.5, 0.0, 1.0)
    );
    aurora = mix(aurora,
      cSecondary * 0.18,
      clamp(length(q) * 0.7, 0.0, 1.0)
    );
    aurora = mix(aurora,
      cPrimary * 0.28,
      clamp(r.x * r.y * 1.8, 0.0, 1.0)
    );

    col += aurora * 0.40;

    /* ── Secondary accent pulse: subtle secondary #45576D highlight ── */
    float pulse = sin(t * 3.2 + p.x * 1.4) * 0.5 + 0.5;
    pulse *= sin(t * 2.1 - p.y * 1.8) * 0.5 + 0.5;
    float accent = fbm(p * 1.4 + t * vec2(0.3, -0.4));
    col += cSecondary * 0.08 * accent * pulse;

    /* ── Plasma rivers: 5 subtle #23364F / #45576D energy streams ── */
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float phase  = fi * 1.256;
      float freq   = 0.8 + fi * 0.30;
      float speed  = 0.35 + fi * 0.12;
      float amp    = 0.20 + fi * 0.03;

      float riverY =
          amp * sin(p.x * freq + t * speed * 8.0 + phase)
        + amp * 0.4 * sin(p.x * freq * 2.0 - t * speed * 6.0 + phase * 1.3)
        + amp * 0.2 * sin(p.x * freq * 0.5 + t * speed * 4.0 + phase * 0.7);

      float spreadY = (fi / 4.0) * 2.4 - 1.2;
      float dist = abs(p.y - riverY - spreadY);

      /* Extremely subtle — just a faint glow line */
      float bloom = clamp(0.0008 / (dist * dist + 0.0002), 0.0, 1.0);
      float halo  = clamp(0.004  / (dist * dist + 0.002),  0.0, 1.0);

      float blend = fi / 4.0;
      vec3 riverCol = mix(
        cPrimary * 0.35,
        cSecondary * 0.40,
        blend
      );

      col += riverCol * (bloom * 0.14 + halo * 0.05);
    }

    /* ── Tech dot-grid overlay ───────────────────── */
    float gridScale = 20.0;
    vec2 gp = fract(p * gridScale + 0.5);
    float gridDot = smoothstep(0.52, 0.44, length(gp - 0.5));
    col += cSecondary * 0.08 * gridDot;

    /* Fine grid lines */
    float gx = smoothstep(0.96, 1.0, gp.x) + smoothstep(0.96, 1.0, gp.y)
             + smoothstep(0.04, 0.0, gp.x) + smoothstep(0.04, 0.0, gp.y);
    col += cPrimary * 0.05 * gx;

    /* ── Subtle animated scanlines ───────────────── */
    float scan = sin(uv.y * uResolution.y * 1.5 + t * 20.0) * 0.5 + 0.5;
    col += cSecondary * 0.02 * scan;

    /* ── Radial vignette — darkens edges strongly towards black ─────────── */
    vec2 vc = uv - 0.5;
    float vignette = 1.0 - dot(vc, vc) * 2.8;
    col *= clamp(vignette, 0.0, 1.0);

    /* ── Center soft glow (atmospheric core) ─────── */
    float centerGlow = exp(-dot(p, p) * 0.35);
    col += cPrimary * 0.08 * centerGlow;

    /* ── Light mode overlay ───────────────────────── */
    vec3 lightOverlay = mix(cSecondary, vec3(0.0), uDark);
    col = mix(col + lightOverlay * 0.30, col, uDark);

    col = clamp(col, 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ─── Inner shader mesh ─────────────────────────────── */
function AuroraFluid() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo<Record<string, THREE.IUniform>>(() => ({
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uDark:       { value: 1.0 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useEffect(() => {
    const onResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [uniforms]);

  useFrame(() => {
    uniforms.uTime.value = performance.now() * 0.001;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* ─── CSS floating particles overlay ───────────────── */
function CSSParticles() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 28 }).map((_, i) => {
        const size   = 1.5 + (i % 5) * 0.8;
        const left   = ((i * 37 + 13) % 97);
        const top    = ((i * 23 + 7) % 95);
        const dur    = 6 + (i % 7) * 2.5;
        const delay  = -(i * 1.1) % dur;
        const opacity = 0.14 + (i % 4) * 0.06;
        return (
          <span
            key={i}
            style={{
              position:    "absolute",
              left:        `${left}%`,
              top:         `${top}%`,
              width:       size,
              height:      size,
              borderRadius:"50%",
              background:  i % 3 === 0
                ? "rgba(69,87,109,0.70)"
                : i % 3 === 1
                  ? "rgba(255,255,255,0.50)"
                  : "rgba(35,54,79,0.65)",
              boxShadow:   i % 3 === 0
                ? "0 0 5px 1px rgba(69,87,109,0.3)"
                : "0 0 3px 1px rgba(255,255,255,0.2)",
              opacity: 0.08 + (i % 4) * 0.04,
              animation:   `skywin-particle-float ${dur}s ${delay}s ease-in-out infinite`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes skywin-particle-float {
          0%,100% { transform: translateY(0px) scale(1); opacity: inherit; }
          33%      { transform: translateY(-18px) scale(1.1); }
          66%      { transform: translateY(8px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

/* ─── Exported component ─────────────────────────────── */
export default function FluidBackground() {
  return (
    <div
      style={{
        position:      "fixed",
        inset:         0,
        width:         "100vw",
        height:        "100vh",
        zIndex:        0,
        pointerEvents: "none",
        background:    "#030508",
      }}
      aria-hidden="true"
    >
      <SafeCanvas
        orthographic
        camera={{ zoom: 1, near: -1, far: 1, position: [0, 0, 0] }}
        gl={{
          antialias:         false,
          alpha:             false,
          powerPreference:   "default",
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1}
        style={{ width: "100%", height: "100%" }}
        fallback={
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(35, 54, 79, 0.35) 0%, rgba(7, 11, 20, 0.95) 75%, #030508 100%)",
            }}
          />
        }
      >
        <AuroraFluid />
      </SafeCanvas>

      {/* CSS floating particle dots layered on top */}
      <CSSParticles />
    </div>
  );
}
