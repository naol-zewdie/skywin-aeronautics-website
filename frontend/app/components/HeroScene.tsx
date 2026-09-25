"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Mouse-reactive camera rig ─── */
function CameraRig() {
  const { size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / size.width - 0.5) * 2;
      mouse.current.y = -(e.clientY / size.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [size]);

  useFrame((state) => {
    state.camera.position.x +=
      (mouse.current.x * 0.5 - state.camera.position.x) * 0.035;
    state.camera.position.y +=
      (mouse.current.y * 0.3 - state.camera.position.y) * 0.035;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Floating drone wireframe (holographic additive blending) ─── */
function DroneWireframe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.16;
      meshRef.current.rotation.y = t * 0.22;
      meshRef.current.position.y = Math.sin(t * 0.6) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.35;
      ringRef.current.rotation.x = Math.sin(t * 0.25) * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.22;
      ring2Ref.current.rotation.y = t * 0.14;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.1;
      coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Holographic glowing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#45576D"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core: icosahedron wireframe — additive blending over fluid aurora */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#45576D"
          wireframe
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer orbit ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.7, 0.012, 8, 80]} />
        <meshBasicMaterial
          color="#23364F"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer orbit ring 2 (tilted) */}
      <mesh ref={ring2Ref} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[2.2, 0.009, 6, 80]} />
        <meshBasicMaterial
          color="#6a7e98"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Background star-field particles with additive blending ─── */
function StarField() {
  const count = 260;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (pseudoRandom(i * 3) - 0.5) * 18;
      arr[i * 3 + 1] = (pseudoRandom(i * 3 + 1) - 0.5) * 10;
      arr[i * 3 + 2] = (pseudoRandom(i * 3 + 2) - 0.5) * 10 - 2;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.018;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#8fa3bf"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Ambient floating hexagons (cohesive with fluid palette) ─── */
function FloatingHex({
  position,
  speed,
  scale,
}: {
  position: [number, number, number];
  speed: number;
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(
    () => pseudoRandom(position[0] * 10 + position[1]) * Math.PI * 2,
    [position]
  );

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] +
        Math.sin(state.clock.elapsedTime * speed + offset) * 0.22;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.35;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <cylinderGeometry args={[0.1, 0.1, 0.01, 6]} />
      <meshBasicMaterial
        color="#45576D"
        wireframe
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const hexPositions: Array<{
  pos: [number, number, number];
  speed: number;
  scale: number;
}> = [
  { pos: [-3.5, 1.2, -2], speed: 0.5, scale: 1 },
  { pos: [3.8, -0.8, -2.5], speed: 0.4, scale: 1.5 },
  { pos: [-4.5, -1.5, -1.5], speed: 0.6, scale: 0.8 },
  { pos: [4.2, 1.5, -3], speed: 0.35, scale: 1.2 },
  { pos: [1.5, 2.2, -2], speed: 0.55, scale: 0.7 },
  { pos: [-2, -2, -2.5], speed: 0.45, scale: 1.1 },
];

/* ─── Main exported component ─── */
export default function HeroScene() {
  return (
    <div
      className="hero-canvas-container"
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        maskImage:
          "radial-gradient(ellipse 90% 80% at 50% 50%, black 50%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 80% at 50% 50%, black 50%, transparent 100%)",
      }}
    >
      <Canvas
        className="three-canvas"
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        {/* Soft dark fog tuned to FluidBackground near-black #04060a */}
        <fog attach="fog" args={["#04060a", 12, 30]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#6a7e98" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#23364F" />
        <pointLight position={[0, 0, 4]} intensity={0.4} color="#45576D" />

        <CameraRig />
        <StarField />
        <DroneWireframe />
        {hexPositions.map((h, i) => (
          <FloatingHex
            key={i}
            position={h.pos}
            speed={h.speed}
            scale={h.scale}
          />
        ))}
      </Canvas>
    </div>
  );
}
