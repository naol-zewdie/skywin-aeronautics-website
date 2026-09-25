'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function pr(s: number): number {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Telemetry Wave Rings radiating outward
function TelemetryRing({
  radius,
  speed,
  delay,
  color,
}: {
  radius: number;
  speed: number;
  delay: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime * speed + delay) % 3;
      const scale = 0.5 + t * (radius / 1.5);
      ref.current.scale.set(scale, scale, 1);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.45 * (1 - t / 3));
      }
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 3, 0, 0]}>
      <ringGeometry args={[1, 1.025, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Central spinning radar / data sphere with satellite nodes
function RadarCore() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const COUNT = 35;
  const nodes = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const theta = pr(i * 4) * Math.PI * 2;
      const phi = Math.acos(2 * pr(i * 4 + 1) - 1);
      const r = 1.3 + pr(i * 4 + 2) * 0.9;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        size: 0.035 + pr(i * 4 + 3) * 0.04,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.15;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.06;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Holographic Pulse Orb */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial
          color="#23364F"
          emissive="#45576D"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>

      {/* Orbiting Telemetry Data Nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[node.size, 12, 12]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#45576D' : i % 3 === 1 ? '#ffffff' : '#6a7e98'}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Horizon Latitude Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.008, 8, 64]} />
        <meshBasicMaterial color="#45576D" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[2.0, 0.006, 8, 64]} />
        <meshBasicMaterial color="#23364F" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Star & Telemetry Signal Dust
function TelemetryDust() {
  const COUNT = 160;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (pr(i * 3) - 0.5) * 20;
      arr[i * 3 + 1] = (pr(i * 3 + 1) - 0.5) * 12;
      arr[i * 3 + 2] = (pr(i * 3 + 2) - 0.5) * 8 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#8fa3bf"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function InsightsScene() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 1.2, 5.2], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={['#04060a', 8, 18]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 4, 3]} color="#45576D" intensity={1.4} distance={12} />
        <pointLight position={[-3, -2, 2]} color="#23364F" intensity={0.8} distance={10} />

        <TelemetryDust />
        <RadarCore />
        <TelemetryRing radius={2.2} speed={0.8} delay={0} color="#45576D" />
        <TelemetryRing radius={2.8} speed={0.8} delay={1} color="#6a7e98" />
        <TelemetryRing radius={3.4} speed={0.8} delay={2} color="#23364F" />
      </Canvas>
    </div>
  );
}
