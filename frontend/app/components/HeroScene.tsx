"use client";

import { useRef, useMemo, useEffect, useState } from "react";
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
    state.camera.position.x += (mouse.current.x * 0.6 - state.camera.position.x) * 0.04;
    state.camera.position.y += (mouse.current.y * 0.35 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Floating drone wireframe (icosahedron + ring) ─── */
function DroneWireframe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.18;
      meshRef.current.rotation.y = t * 0.26;
      meshRef.current.position.y = Math.sin(t * 0.7) * 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.25;
      ring2Ref.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group>
      {/* Core: icosahedron wireframe */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#45576D"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Outer orbit ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.7, 0.012, 8, 80]} />
        <meshBasicMaterial color="#23364F" transparent opacity={0.4} />
      </mesh>

      {/* Outer orbit ring 2 (tilted) */}
      <mesh ref={ring2Ref} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[2.2, 0.008, 6, 80]} />
        <meshBasicMaterial color="#6a7e98" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Background star-field particles ─── */
function StarField() {
  const count = 280;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (pseudoRandom(i * 3) - 0.5) * 18;
      arr[i * 3 + 1] = (pseudoRandom(i * 3 + 1) - 0.5) * 10;
      arr[i * 3 + 2] = (pseudoRandom(i * 3 + 2) - 0.5) * 10 - 3;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#8aaecb"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Ambient floating hexagons ─── */
function FloatingHex({ position, speed, scale }: { position: [number, number, number]; speed: number; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => pseudoRandom(position[0] * 10 + position[1]) * Math.PI * 2, [position]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.25;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.4;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <cylinderGeometry args={[0.1, 0.1, 0.01, 6]} />
      <meshBasicMaterial color="#45576D" wireframe transparent opacity={0.35} />
    </mesh>
  );
}

const hexPositions: Array<{ pos: [number, number, number]; speed: number; scale: number }> = [
  { pos: [-3.5, 1.2, -2], speed: 0.5, scale: 1 },
  { pos: [3.8, -0.8, -2.5], speed: 0.4, scale: 1.5 },
  { pos: [-4.5, -1.5, -1.5], speed: 0.6, scale: 0.8 },
  { pos: [4.2, 1.5, -3], speed: 0.35, scale: 1.2 },
  { pos: [1.5, 2.2, -2], speed: 0.55, scale: 0.7 },
  { pos: [-2, -2, -2.5], speed: 0.45, scale: 1.1 },
];

/* ─── Main exported component ─── */
export default function HeroScene() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const fogColor = isDark ? "#0f1924" : "#d4dde8";

  return (
    <div className="hero-canvas-container" aria-hidden="true">
      <Canvas
        className="three-canvas"
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={[fogColor, 8, 20]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#6a7e98" />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#23364F" />

        <CameraRig />
        <StarField />
        <DroneWireframe />
        {hexPositions.map((h, i) => (
          <FloatingHex key={i} position={h.pos} speed={h.speed} scale={h.scale} />
        ))}
      </Canvas>
    </div>
  );
}
