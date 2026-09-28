'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SafeCanvas from './SafeCanvas';

function pr(s: number): number {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}


/* ── Rising rocket trajectory path ── */
function LaunchTrajectory() {
  const rocketRef   = useRef<THREE.Mesh>(null);
  const trailRef    = useRef<THREE.Points>(null);
  const progressRef = useRef(0);

  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.5, -2.8, 0),
    new THREE.Vector3(-2.0, -1.8, 0.5),
    new THREE.Vector3(-0.5,  0.2, 1.0),
    new THREE.Vector3( 1.2,  2.0, 0.5),
    new THREE.Vector3( 2.8,  3.5, 0),
  ]), []);

  const trailPositions = useMemo(() => {
    const pts = curve.getPoints(80);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [curve]);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.14) % 1;
    const pt = curve.getPoint(progressRef.current);
    if (rocketRef.current) rocketRef.current.position.set(pt.x, pt.y, pt.z);
  });

  return (
    <group>
      {/* Dotted trajectory path */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.025} color="#45576D" transparent opacity={0.5} sizeAttenuation />
      </points>

      {/* Rocket body */}
      <group ref={rocketRef}>
        {/* Fuselage */}
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.08, 0.12, 0.38, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0.17, 0.17, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <coneGeometry args={[0.08, 0.2, 12]} />
          <meshStandardMaterial color="#45576D" metalness={0.8} roughness={0.2} emissive="#45576D" emissiveIntensity={0.3} />
        </mesh>
        {/* Engine glow */}
        <mesh position={[-0.12, -0.12, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#ff6a3d" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Floating hexagonal tiles (honeycomb / teamwork metaphor) ── */
interface HexTileProps {
  position: [number, number, number];
  speed: number;
  color: string;
  size: number;
}

function HexTile({ position, speed, color, size }: HexTileProps) {
  const ref    = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => pr(position[0] * 7 + position[1]) * Math.PI * 2, [position]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.2;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={size}>
      <cylinderGeometry args={[0.18, 0.18, 0.025, 6]} />
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.3}
        transparent
        opacity={0.65}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

const HEX_TILES: HexTileProps[] = [
  { position: [-4.2,  1.5, -2.0], speed: 0.45, color: '#45576D', size: 1.0 },
  { position: [ 4.5, -1.0, -2.5], speed: 0.38, color: '#45576D', size: 1.4 },
  { position: [-3.8, -2.0, -1.5], speed: 0.52, color: '#23364F', size: 0.9 },
  { position: [ 4.0,  2.0, -3.0], speed: 0.33, color: '#45576D', size: 1.1 },
  { position: [ 1.8,  3.2, -2.0], speed: 0.48, color: '#45576D', size: 0.8 },
  { position: [-2.5, -3.0, -2.5], speed: 0.40, color: '#23364F', size: 1.2 },
  { position: [ 3.0,  0.5, -1.5], speed: 0.55, color: '#45576D', size: 0.7 },
  { position: [-1.5,  2.8, -2.0], speed: 0.35, color: '#45576D', size: 1.0 },
];

/* ── Star field ── */
function StarField() {
  const COUNT = 220;
  const pos = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3]     = (pr(i * 3)     - 0.5) * 22;
      a[i * 3 + 1] = (pr(i * 3 + 1) - 0.5) * 14;
      a[i * 3 + 2] = (pr(i * 3 + 2) - 0.5) * 10 - 3;
    }
    return a;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y = performance.now() * 0.001 * 0.013; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.016} color="#ffffff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function CareersScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
      <SafeCanvas camera={{ position: [0, 0, 8], fov: 52 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <fog attach="fog" args={['#030810', 14, 28]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 5, 4]}   color="#45576D" intensity={1.8} distance={14} />
        <pointLight position={[-4, -2, 2]}  color="#23364F" intensity={1.0} distance={12} />
        <pointLight position={[0, 0, 2]}    color="#45576D" intensity={0.5} distance={8} />
        <StarField />
        <LaunchTrajectory />
        {HEX_TILES.map((h, i) => (
          <HexTile key={i} {...h} />
        ))}
      </SafeCanvas>
    </div>
  );
}
