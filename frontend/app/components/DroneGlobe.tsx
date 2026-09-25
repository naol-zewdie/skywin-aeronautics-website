"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import SafeCanvas from "./SafeCanvas";
import { OrbitControls, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   3D High-Tech Quadcopter Drone — Enhanced Edition
   ✦ IBL Environment map for photorealistic metallic reflections
   ✦ Bloom post-processing glow on LEDs, propellers & emissives
   ✦ Chromatic aberration + Vignette for cinematic feel
   ✦ Pulsing LED halos (point lights on each motor)
   ✦ Propeller heat shimmer (animated blur disc opacity)
   ✦ Floating particle exhaust stream
   ✦ Animated emissive pulse on accent stripe & sensor strip
───────────────────────────────────────────────────────────── */

interface MotorProps {
  position: [number, number, number];
  isClockwise: boolean;
  ledColor: string;
  ledColorHex: number;
}

function RotorMotor({ position, isClockwise, ledColor, ledColorHex }: MotorProps) {
  const propRef    = useRef<THREE.Group>(null);
  const blurRef    = useRef<THREE.Mesh>(null);
  const lightRef   = useRef<THREE.PointLight>(null);
  const ledRef     = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // Fast rotor spin
    if (propRef.current) {
      propRef.current.rotation.y += (isClockwise ? 1 : -1) * delta * 32;
    }

    // Blur disc opacity: flicker like a real rotor under light
    if (blurRef.current) {
      const mat = blurRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = 0.10 + Math.sin(t * 12 + ledColorHex) * 0.04;
    }

    // LED pulse — gently breathes
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 2.8 + ledColorHex) * 0.6;
    }

    // LED sphere emissive pulse
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 1.5 + Math.sin(t * 3.0 + ledColorHex) * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Pulsing LED point light (drives Bloom) */}
      <pointLight
        ref={lightRef}
        color={ledColor}
        intensity={1.2}
        distance={2.2}
        decay={2}
      />

      {/* Motor Bell / Mount */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.16, 0.22, 20]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.92}
          roughness={0.18}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Motor Accent Ring */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
        <meshStandardMaterial
          color="#45576D"
          metalness={0.95}
          roughness={0.10}
          emissive="#23364F"
          emissiveIntensity={0.8}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* LED Tip — high emissive for Bloom */}
      <mesh ref={ledRef} position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={2.0}
          roughness={0}
          metalness={0}
        />
      </mesh>

      {/* LED glow halo sprite (larger sphere, very transparent) */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={ledColor} transparent opacity={0.12} />
      </mesh>

      {/* Spinning Propeller Assembly */}
      <group ref={propRef} position={[0, 0.14, 0]}>
        {/* Center Prop Hub */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.07, 14]} />
          <meshStandardMaterial
            color="#45576D"
            metalness={0.95}
            roughness={0.15}
            emissive="#23364F"
            emissiveIntensity={0.5}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Blade */}
        <mesh position={[0, 0.01, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.1, 0.012, 0.95]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.7}
            roughness={0.25}
            envMapIntensity={1.0}
          />
        </mesh>

        {/* Blade tips — emissive for Bloom pickup */}
        <mesh position={[0, 0.011, 0.43]}>
          <boxGeometry args={[0.102, 0.014, 0.12]} />
          <meshStandardMaterial color="#566A80" emissive="#566A80" emissiveIntensity={1.4} roughness={0} metalness={0} />
        </mesh>
        <mesh position={[0, 0.011, -0.43]}>
          <boxGeometry args={[0.102, 0.014, 0.12]} />
          <meshStandardMaterial color="#566A80" emissive="#566A80" emissiveIntensity={1.4} roughness={0} metalness={0} />
        </mesh>

        {/* Rotor blur disc */}
        <mesh ref={blurRef} position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.004, 28]} />
          <meshStandardMaterial
            color="#45576D"
            transparent
            opacity={0.12}
            roughness={0.05}
            emissive="#23364F"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ── Particle exhaust stream below the drone ── */
function ExhaustParticles() {
  const COUNT = 80;
  const ref   = useRef<THREE.Points>(null);

  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const lifetimes  = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 1] = -0.5 - Math.random() * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
      velocities[i * 3]     = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = -0.005 - Math.random() * 0.012;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
      lifetimes[i] = Math.random();
    }
    return { positions, velocities, lifetimes };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      lifetimes[i]   -= 0.008;
      if (lifetimes[i] <= 0) {
        pos[i * 3]     = (Math.random() - 0.5) * 2.8;
        pos[i * 3 + 1] = -0.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
        lifetimes[i]   = 1.0;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#45576D"
        transparent
        opacity={0.28}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function QuadcopterDrone() {
  const droneGroupRef = useRef<THREE.Group>(null);
  const stripeRef     = useRef<THREE.Mesh>(null);
  const sensorRef     = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;

    // Hover bob + tilt
    if (droneGroupRef.current) {
      droneGroupRef.current.position.y = Math.sin(t * 1.6) * 0.07;
      droneGroupRef.current.rotation.z = Math.sin(t * 0.9) * 0.025;
      droneGroupRef.current.rotation.x = Math.cos(t * 1.1) * 0.02;
    }

    // Accent stripe emissive pulse
    if (stripeRef.current) {
      const mat = stripeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 1.0 + Math.sin(t * 2.2) * 0.5;
    }

    // Sensor strip sweep
    if (sensorRef.current) {
      const mat = sensorRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.8 + Math.sin(t * 4.0 + 1.0) * 0.5;
    }
  });

  return (
    <group ref={droneGroupRef} scale={1.05}>

      {/* ── CENTRAL HULL ── */}
      <mesh>
        <boxGeometry args={[0.72, 0.16, 1.15]} />
        <meshStandardMaterial
          color="#0b0f19"
          metalness={0.88}
          roughness={0.18}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* Upper Canopy */}
      <mesh position={[0, 0.13, -0.05]}>
        <boxGeometry args={[0.54, 0.14, 0.85]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.95}
          roughness={0.15}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* #566A80 Clean Aviation Accent Stripe */}
      <mesh ref={stripeRef} position={[0, 0.205, -0.05]}>
        <boxGeometry args={[0.06, 0.015, 0.72]} />
        <meshStandardMaterial
          color="#566A80"
          emissive="#566A80"
          emissiveIntensity={1.0}
          roughness={0}
          metalness={0}
        />
      </mesh>

      {/* Front Avionics Sensor Strip */}
      <mesh ref={sensorRef} position={[0, 0.12, -0.48]}>
        <boxGeometry args={[0.32, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#45576D"
          emissive="#45576D"
          emissiveIntensity={0.8}
          roughness={0}
          metalness={0}
        />
      </mesh>

      {/* Rear Battery Bay */}
      <mesh position={[0, 0.04, 0.52]}>
        <boxGeometry args={[0.48, 0.14, 0.3]} />
        <meshStandardMaterial
          color="#23364F"
          metalness={0.80}
          roughness={0.25}
          envMapIntensity={1.2}
          emissive="#23364F"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ── FPV GIMBAL CAMERA ── */}
      <group position={[0, -0.08, -0.62]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.07, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} envMapIntensity={1.5} />
        </mesh>
        <mesh position={[0, -0.02, -0.08]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.1} envMapIntensity={2.0} />
        </mesh>
        {/* Lens aperture — emissive */}
        <mesh position={[0, -0.02, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color="#45576D" emissive="#45576D" emissiveIntensity={0.9} roughness={0} metalness={0} />
        </mesh>
      </group>

      {/* ── 4 DIAGONAL ARMS ── */}
      {[
        { pos: [0.70, 0.02, -0.62] as [number,number,number], rot: [0, -0.72, 0] as [number,number,number] },
        { pos: [-0.70, 0.02, -0.62] as [number,number,number], rot: [0,  0.72, 0] as [number,number,number] },
        { pos: [0.72, 0.02,  0.62] as [number,number,number], rot: [0,  0.72, 0] as [number,number,number] },
        { pos: [-0.72, 0.02, 0.62] as [number,number,number], rot: [0, -0.72, 0] as [number,number,number] },
      ].map(({ pos, rot }, i) => (
        <mesh key={i} position={pos} rotation={rot}>
          <boxGeometry args={[0.11, 0.07, 1.35]} />
          <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.22} envMapIntensity={1.4} />
        </mesh>
      ))}

      {/* ── 4 MOTORS: Front navigation #566A80, Rear beacon red ── */}
      <RotorMotor position={[ 1.18, 0.06, -1.05]} isClockwise={false} ledColor="#566A80" ledColorHex={0x566a80} />
      <RotorMotor position={[-1.18, 0.06, -1.05]} isClockwise={true}  ledColor="#566A80" ledColorHex={0x566a80} />
      <RotorMotor position={[ 1.18, 0.06,  1.05]} isClockwise={true}  ledColor="#ef4444" ledColorHex={0xef4444} />
      <RotorMotor position={[-1.18, 0.06,  1.05]} isClockwise={false} ledColor="#ef4444" ledColorHex={0xef4444} />

      {/* ── LANDING SKIDS ── */}
      {[-0.42, 0.42].map((x, si) => (
        <group key={si}>
          <mesh position={[x, -0.18, -0.28]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} envMapIntensity={1.2} />
          </mesh>
          <mesh position={[x, -0.18, 0.28]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} envMapIntensity={1.2} />
          </mesh>
          <mesh position={[x, -0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.35, 12]} />
            <meshStandardMaterial
              color="#23364F"
              metalness={0.95}
              roughness={0.15}
              emissive="#23364F"
              emissiveIntensity={0.4}
              envMapIntensity={1.6}
            />
          </mesh>
        </group>
      ))}

      {/* ── ORBIT RINGS ── */}
      <mesh rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[2.5, 0.008, 8, 80]} />
        <meshStandardMaterial color="#45576D" emissive="#45576D" emissiveIntensity={0.8} roughness={0} metalness={0} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-0.8, -0.4, 0]}>
        <torusGeometry args={[2.8, 0.005, 6, 80]} />
        <meshBasicMaterial color="#566A80" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

/* ── Main key light that pulsates ── */
function PulsingKeyLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
    }
  });
  return <pointLight ref={lightRef} position={[0, 4, 2]} color="#45576D" intensity={2.0} distance={12} decay={2} />;
}

export default function DroneGlobe() {
  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing" style={{ minHeight: "360px" }}>
      <SafeCanvas
        camera={{ position: [3.4, 2.3, 4.4], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        {/* ── Procedural IBL — no file fetch, pure Lightformer env map ── */}
        <Environment resolution={256} environmentIntensity={0.65}>
          {/* Top fill — #566A80 */}
          <Lightformer intensity={1.8} form="rect" color="#566A80" position={[0, 5, -4]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
          {/* Key light — secondary #45576D */}
          <Lightformer intensity={2.0} form="rect" color="#45576D" position={[5, 2, 2]}  scale={[6, 6, 1]} rotation-y={-Math.PI / 3} />
          {/* Rim light — primary #23364F */}
          <Lightformer intensity={1.4} form="rect" color="#23364F" position={[-5, 1, 2]} scale={[6, 4, 1]} rotation-y={Math.PI / 3} />
          {/* Ground bounce — near black */}
          <Lightformer intensity={0.6} form="rect" color="#04060a" position={[0, -4, 0]} scale={[10, 1, 1]} rotation-x={-Math.PI / 2} />
          {/* Back fill — deep primary */}
          <Lightformer intensity={0.8} form="rect" color="#23364F" position={[0, 1, -5]} scale={[8, 5, 1]} />
        </Environment>

        {/* ── Cinematic Lights ── */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[6, 12, 8]}   intensity={1.4} color="#ffffff" castShadow />
        <directionalLight position={[-6, -4, -6]} intensity={0.7} color="#45576D" />
        <PulsingKeyLight />
        <pointLight position={[-3, 2, 4]}  color="#45576D" intensity={0.9} distance={9} decay={2} />
        <pointLight position={[3, -2, -3]} color="#23364F" intensity={0.6} distance={7} decay={2} />

        {/* ── Scene ── */}
        <QuadcopterDrone />
        <ExhaustParticles />

        {/* ── Post-Processing Effects ── */}
        <EffectComposer>
          {/* Bloom — makes all emissive surfaces glow beautifully */}
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.85}
            mipmapBlur
            radius={0.7}
          />
          {/* Subtle chromatic aberration for lens realism */}
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0005, 0.0005)}
            radialModulation={false}
            modulationOffset={0}
          />
          {/* Vignette to push focus to center */}
          <Vignette
            offset={0.3}
            darkness={0.6}
            eskil={false}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>

        {/* ── 360° Interactive Orbit Controls ── */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.9}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </SafeCanvas>

      {/* Interaction hint */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(255, 255, 255, 0.8)",
          background: "rgba(8,10,18,0.75)",
          border: "1px solid rgba(69, 87, 109, 0.40)",
          backdropFilter: "blur(12px)",
        }}
      >
        <svg
          className="w-3.5 h-3.5 animate-spin text-[#45576D]"
          style={{ animationDuration: "6s" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        <span>360° Interactive — Drag to rotate</span>
      </div>
    </div>
  );
}
