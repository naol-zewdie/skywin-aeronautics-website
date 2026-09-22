"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   TECHY PLASMA RIVERS — Navy · Black · Electric Blue · White
   Full-screen GLSL shader: flowing neon energy streams on dark bg
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

  /* ── Glow function: tight glowing line ──────────── */
  float glow(float dist, float radius) {
    return clamp(radius / (dist * dist + 0.0001), 0.0, 1.0);
  }

  /* ── Hash for pseudo-random variation ───────────── */
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  /* ── Smooth noise ────────────────────────────────── */
  float snoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = fract(sin(dot(i,              vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1, 0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0, 1), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1, 1), vec2(127.1, 311.7))) * 43758.5453);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    /* center-origin UV, aspect-correct */
    vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

    float t = uTime * 0.55;   /* speed — clearly visible */

    /* ── Base: near-black with subtle navy tint ──── */
    vec3 col = mix(
      vec3(0.004, 0.008, 0.020),  /* light mode: very dark navy */
      vec3(0.004, 0.008, 0.020),  /* dark mode: same */
      uDark
    );

    /* ══ PLASMA RIVERS ═══════════════════════════════
       7 glowing neon streams flowing across the screen.
       Each has a unique sinusoidal path driven by time.
    ═══════════════════════════════════════════════ */
    float totalGlow = 0.0;
    vec3 totalColor = vec3(0.0);

    for (int i = 0; i < 7; i++) {
      float fi = float(i);

      /* unique phase and frequency per river */
      float phase  = fi * 0.897;                  /* ~golden angle spread */
      float freq   = 1.1 + fi * 0.35;
      float speed  = 0.5 + fi * 0.18;
      float amp    = 0.28 + fi * 0.04;

      /* The river's Y position: layered sines for organic movement */
      float riverY =
          amp * sin(p.x * freq       + t * speed        + phase)
        + amp * 0.45 * sin(p.x * freq * 2.1 - t * speed * 0.7 + phase * 1.5)
        + amp * 0.25 * sin(p.x * freq * 0.5  + t * speed * 0.3 + phase * 0.8);

      /* Spread rivers across the vertical range */
      float spreadY = (fi / 6.0) * 2.2 - 1.1;
      float dist = abs(p.y - riverY - spreadY);

      /* Glow layers: subtle, dimmer core + soft glow */
      float core  = glow(dist, 0.00008);    /* very fine core */
      float bloom = glow(dist, 0.0015);     /* gentle soft glow */
      float halo  = glow(dist, 0.008);      /* subtle ambient halo */

      float riverGlow = core * 0.50 + bloom * 0.20 + halo * 0.05;

      /* Color per river: deep electric-blue → muted cyan */
      float blend = fi / 6.0;
      vec3 riverCol = mix(
        vec3(0.03, 0.16, 0.58),   /* deep subdued navy/blue */
        vec3(0.12, 0.40, 0.68),   /* subdued cyan */
        blend
      );
      /* Gentle highlight without harsh glare */
      riverCol = mix(riverCol, vec3(0.55, 0.75, 0.95), clamp(core * 0.3, 0.0, 1.0));

      totalColor += riverCol * riverGlow;
      totalGlow  += riverGlow;
    }

    col += totalColor * 0.14;

    /* ══ BACKGROUND NEBULA ═══════════════════════════
       Low-frequency noise field adds depth/atmosphere.
    ═══════════════════════════════════════════════ */
    float nx = snoise(p * 0.7 + vec2(t * 0.08,  t * 0.05));
    float ny = snoise(p * 0.7 + vec2(t * 0.06, -t * 0.09) + 5.3);
    float nebula = snoise(p * 0.9 + vec2(nx, ny) * 0.5 + t * 0.04);
    nebula = nebula * nebula;
    col += vec3(0.005, 0.015, 0.04) * nebula * 0.20;

    /* ══ TECH GRID ═══════════════════════════════════
       Subtle dot-grid overlay gives the "circuit board"
       techy feel without overwhelming the rivers.
    ═══════════════════════════════════════════════ */
    float gridScale = 14.0;
    vec2 gp = fract(p * gridScale + 0.5);
    float gridDot = smoothstep(0.5, 0.42, length(gp - 0.5));
    col += vec3(0.01, 0.03, 0.08) * gridDot * 0.12;

    /* Fine grid lines */
    float gx = smoothstep(0.97, 1.0, gp.x) + smoothstep(0.97, 1.0, gp.y)
             + smoothstep(0.03, 0.0, gp.x) + smoothstep(0.03, 0.0, gp.y);
    col += vec3(0.005, 0.015, 0.04) * gx * 0.18;

    /* ══ SCANLINE ACCENT ════════════════════════════ */
    float scan = sin(uv.y * uResolution.y * 0.75) * 0.5 + 0.5;
    col += vec3(0.0, 0.01, 0.03) * scan * 0.15;

    /* ══ VIGNETTE ═══════════════════════════════════ */
    vec2 vc = uv - 0.5;
    float vignette = 1.0 - dot(vc, vc) * 1.8;
    col *= clamp(vignette, 0.0, 1.0);

    /* ══ LIGHT-MODE TINT ════════════════════════════
       In light mode, brighten the whole scene so it
       reads as navy-blue rather than black.
    ═══════════════════════════════════════════════ */
    vec3 lightOverlay = mix(vec3(0.55, 0.70, 0.90), vec3(0.0), uDark);
    col = mix(col + lightOverlay * 0.25, col, uDark);

    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ─── Inner shader mesh ─────────────────────────────── */
function TechyFluid({ isDark }: { isDark: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const needsUpdate = useRef(false);

  /* Create uniforms once — stable reference for the material */
  const uniforms = useMemo<Record<string, THREE.IUniform>>(() => ({
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uDark:       { value: isDark ? 1.0 : 0.0 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  /* Sync isDark changes */
  useEffect(() => {
    uniforms.uDark.value = isDark ? 1.0 : 0.0;
    needsUpdate.current = true;
  }, [isDark, uniforms]);

  /* Sync resize */
  useEffect(() => {
    const onResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [uniforms]);

  /* Animate — uTime drives all motion */
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.needsUpdate = false; // uniforms update automatically
    }
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

/* ─── Exported component ─────────────────────────────── */
export default function FluidBackground() {
  const [isDark, setIsDark] = useState(true); // default dark for SSR

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        background: "#03060f", /* fallback while canvas loads */
      }}
      aria-hidden="true"
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, near: -1, far: 1, position: [0, 0, 0] }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1}
        style={{ width: "100%", height: "100%" }}
      >
        <TechyFluid isDark={isDark} />
      </Canvas>
    </div>
  );
}
