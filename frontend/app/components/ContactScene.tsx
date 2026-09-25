'use client';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function pr(s: number): number {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ── Slowly rotating Earth-like sphere ── */
function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const cities = useMemo<[number, number, number][]>(() => {
    const coords: [number, number][] = [
      [9.0, 38.7],    // Addis Ababa (home)
      [51.5, -0.1],   // London
      [40.7, -74.0],  // New York
      [35.7, 139.7],  // Tokyo
      [-33.9, 18.4],  // Cape Town
      [25.2, 55.3],   // Dubai
      [48.9, 2.3],    // Paris
      [-23.5, -46.6], // Sao Paulo
      [1.3, 103.8],   // Singapore
      [55.8, 37.6],   // Moscow
    ];
    return coords.map(([lat, lon]) => {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 1.52;
      return [
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta),
      ];
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.rotation.y = t * 0.09;
    if (glowRef.current) glowRef.current.rotation.y = t * 0.09;
  });

  return (
    <group>
      {/* Atmosphere glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.72, 32, 32]} />
        <meshBasicMaterial color="#1a4a8a" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Globe body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          color="#061830"
          metalness={0.4}
          roughness={0.7}
          emissive="#0a2545"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Latitude lines */}
      {[0, 30, 60, -30, -60].map((lat, i) => {
        const y = 1.51 * Math.sin(lat * Math.PI / 180);
        const r = 1.51 * Math.cos(lat * Math.PI / 180);
        return (
          <mesh key={`lat-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.004, 6, 64]} />
            <meshBasicMaterial color="#1e3a5f" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Longitude lines */}
      {[0, 30, 60, 90, 120, 150].map((lon, i) => (
        <mesh key={`lon-${i}`} rotation={[0, lon * Math.PI / 180, 0]}>
          <torusGeometry args={[1.51, 0.003, 6, 64]} />
          <meshBasicMaterial color="#1e3a5f" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* City dots */}
      {cities.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#ffffff' : '#45576D'}
            emissive={i === 0 ? '#ffffff' : '#45576D'}
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Animated arc between two sphere-surface points ── */
function DataArc({
  from, to, speed, color, delay,
}: {
  from: [number, number, number];
  to:   [number, number, number];
  speed: number;
  color: string;
  delay: number;
}) {
  const dotRef      = useRef<THREE.Mesh>(null);
  const progressRef = useRef(delay % 1);

  const curve = useMemo(() => {
    const v0  = new THREE.Vector3(...from);
    const v1  = new THREE.Vector3(...to);
    const mid = v0.clone().add(v1).normalize().multiplyScalar(2.2);
    return new THREE.QuadraticBezierCurve3(v0, mid, v1);
  }, [from, to]);

  const linePositions = useMemo(() => {
    const pts = curve.getPoints(60);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [curve]);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * speed) % 1;
    const pt = curve.getPoint(progressRef.current);
    if (dotRef.current) dotRef.current.position.set(pt.x, pt.y, pt.z);
  });

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} color={color} transparent opacity={0.35} sizeAttenuation />
      </points>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function DataArcs() {
  const cities = useMemo<[number, number, number][]>(() => {
    const coords: [number, number][] = [
      [9.0, 38.7], [51.5, -0.1], [40.7, -74.0],
      [35.7, 139.7], [-33.9, 18.4], [25.2, 55.3],
      [48.9, 2.3], [-23.5, -46.6], [1.3, 103.8], [55.8, 37.6],
    ];
    return coords.map(([lat, lon]) => {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 1.52;
      return [
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta),
      ];
    });
  }, []);

  return (
    <>
      <DataArc from={cities[0]} to={cities[1]} color="#45576D" speed={0.22} delay={0.0} />
      <DataArc from={cities[0]} to={cities[2]} color="#45576D" speed={0.18} delay={0.3} />
      <DataArc from={cities[0]} to={cities[5]} color="#ffffff" speed={0.26} delay={0.6} />
      <DataArc from={cities[1]} to={cities[3]} color="#6a7e98" speed={0.15} delay={0.1} />
      <DataArc from={cities[2]} to={cities[8]} color="#45576D" speed={0.20} delay={0.5} />
      <DataArc from={cities[5]} to={cities[3]} color="#45576D" speed={0.24} delay={0.8} />
      <DataArc from={cities[6]} to={cities[9]} color="#6a7e98" speed={0.17} delay={0.2} />
      <DataArc from={cities[4]} to={cities[0]} color="#ffffff" speed={0.21} delay={0.9} />
    </>
  );
}

/* ── Orbiting signal rings ── */
function SignalRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) { r1.current.rotation.x = t * 0.18; r1.current.rotation.z = t * 0.08; }
    if (r2.current) { r2.current.rotation.y = t * 0.14; r2.current.rotation.x = Math.PI / 3 + t * 0.05; }
    if (r3.current) { r3.current.rotation.z = t * 0.11; r3.current.rotation.y = t * 0.09; }
  });

  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[2.2, 0.008, 8, 80]} />
        <meshBasicMaterial color="#23364F" transparent opacity={0.5} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.6, 0.005, 6, 80]} />
        <meshBasicMaterial color="#45576D" transparent opacity={0.3} />
      </mesh>
      <mesh ref={r3} rotation={[0.8, 0.4, 0]}>
        <torusGeometry args={[3.0, 0.004, 6, 80]} />
        <meshBasicMaterial color="#23364F" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

/* ── Star field ── */
function StarField() {
  const COUNT = 200;
  const pos = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3]     = (pr(i * 3)     - 0.5) * 20;
      a[i * 3 + 1] = (pr(i * 3 + 1) - 0.5) * 14;
      a[i * 3 + 2] = (pr(i * 3 + 2) - 0.5) * 10 - 3;
    }
    return a;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.012; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#ffffff" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

/* ── Whole scene gently bobs ── */
function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current)
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
  });
  return (
    <group ref={groupRef}>
      <Globe />
      <DataArcs />
      <SignalRings />
    </group>
  );
}

export default function ContactScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
      <Canvas camera={{ position: [0, 1.2, 6.5], fov: 48 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <fog attach="fog" args={['#030810', 12, 26]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 6, 4]}  color="#45576D" intensity={2.0} distance={14} />
        <pointLight position={[-4, -3, 2]} color="#23364F" intensity={1.0} distance={12} />
        <pointLight position={[0, 0, 3]}   color="#ffffff" intensity={0.3} distance={8} />
        <StarField />
        <SceneContent />
      </Canvas>
    </div>
  );
}
