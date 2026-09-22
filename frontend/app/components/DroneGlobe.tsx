"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   3D High-Tech Quadcopter Drone
   - Procedurally modeled with carbon-fiber & metallic materials
   - Rapidly spinning counter-rotating rotor blades
   - Navigation LEDs & front camera gimbal
   - 360° interactive rotation with damping & smooth auto-rotation
───────────────────────────────────────────────────────────── */

interface MotorProps {
  position: [number, number, number];
  isClockwise: boolean;
  ledColor: string;
}

function RotorMotor({ position, isClockwise, ledColor }: MotorProps) {
  const propRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (propRef.current) {
      const speed = delta * 32;
      propRef.current.rotation.y += isClockwise ? speed : -speed;
    }
  });

  return (
    <group position={position}>
      {/* Motor Bell / Mount */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.22, 20]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Motor Accent Ring (Anodized Blue) */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
        <meshStandardMaterial
          color="#0284c7"
          metalness={0.9}
          roughness={0.15}
          emissive="#0284c7"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Arm Tip LED Light */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={ledColor} />
      </mesh>

      {/* Spinning Propeller Assembly */}
      <group ref={propRef} position={[0, 0.14, 0]}>
        {/* Center Prop Hub Nut */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.07, 14]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Blade 1 */}
        <mesh position={[0, 0.01, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.1, 0.012, 0.95]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Blade 1 cyan aerodynamic tip */}
        <mesh position={[0, 0.011, 0.42]}>
          <boxGeometry args={[0.102, 0.014, 0.12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 0.011, -0.42]}>
          <boxGeometry args={[0.102, 0.014, 0.12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* High-speed rotor blur disc */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.004, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.12}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

function QuadcopterDrone() {
  const droneGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (droneGroupRef.current) {
      const t = state.clock.elapsedTime;
      // Hovering bob & gentle dynamic tilt
      droneGroupRef.current.position.y = Math.sin(t * 1.6) * 0.07;
      droneGroupRef.current.rotation.z = Math.sin(t * 0.9) * 0.025;
      droneGroupRef.current.rotation.x = Math.cos(t * 1.1) * 0.02;
    }
  });

  return (
    <group ref={droneGroupRef} scale={1.35}>
      {/* ── CENTRAL HULL / FUSELAGE ── */}
      {/* Lower Chassis (Dark Carbon Fiber) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 0.16, 1.15]} />
        <meshStandardMaterial
          color="#0b0f19"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Upper Aerodynamic Canopy */}
      <mesh position={[0, 0.13, -0.05]}>
        <boxGeometry args={[0.54, 0.14, 0.85]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cyber Neon Accent Stripe on Top */}
      <mesh position={[0, 0.205, -0.05]}>
        <boxGeometry args={[0.06, 0.015, 0.72]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Front Avionics Sensor Strip */}
      <mesh position={[0, 0.12, -0.48]}>
        <boxGeometry args={[0.32, 0.06, 0.04]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Rear Battery Bay */}
      <mesh position={[0, 0.04, 0.52]}>
        <boxGeometry args={[0.48, 0.14, 0.3]} />
        <meshStandardMaterial
          color="#0284c7"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* ── FPV / 4K GIMBAL CAMERA (Front) ── */}
      <group position={[0, -0.08, -0.62]}>
        {/* Gimbal Mount Pitch Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.07, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Camera Lens Body */}
        <mesh position={[0, -0.02, -0.08]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Camera Aperture Lens */}
        <mesh position={[0, -0.02, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* ── 4 DIAGONAL CARBON FIBER ARMS ── */}
      {/* Front-Right Arm */}
      <mesh position={[0.70, 0.02, -0.62]} rotation={[0, -0.72, 0]}>
        <boxGeometry args={[0.11, 0.07, 1.35]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Front-Left Arm */}
      <mesh position={[-0.70, 0.02, -0.62]} rotation={[0, 0.72, 0]}>
        <boxGeometry args={[0.11, 0.07, 1.35]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Rear-Right Arm */}
      <mesh position={[0.72, 0.02, 0.62]} rotation={[0, 0.72, 0]}>
        <boxGeometry args={[0.11, 0.07, 1.35]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Rear-Left Arm */}
      <mesh position={[-0.72, 0.02, 0.62]} rotation={[0, -0.72, 0]}>
        <boxGeometry args={[0.11, 0.07, 1.35]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* ── 4 MOTORS & PROPELLERS ── */}
      {/* Front-Right: Position [1.18, 0.06, -1.05], CCW, Cyan LED */}
      <RotorMotor position={[1.18, 0.06, -1.05]} isClockwise={false} ledColor="#38bdf8" />

      {/* Front-Left: Position [-1.18, 0.06, -1.05], CW, Cyan LED */}
      <RotorMotor position={[-1.18, 0.06, -1.05]} isClockwise={true} ledColor="#38bdf8" />

      {/* Rear-Right: Position [1.18, 0.06, 1.05], CW, Red LED */}
      <RotorMotor position={[1.18, 0.06, 1.05]} isClockwise={true} ledColor="#ef4444" />

      {/* Rear-Left: Position [-1.18, 0.06, 1.05], CCW, Red LED */}
      <RotorMotor position={[-1.18, 0.06, 1.05]} isClockwise={false} ledColor="#ef4444" />

      {/* ── LANDING SKIDS ── */}
      {/* Left Struts & Rail */}
      <mesh position={[-0.42, -0.18, -0.28]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[-0.42, -0.18, 0.28]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[-0.42, -0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.35, 12]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Right Struts & Rail */}
      <mesh position={[0.42, -0.18, -0.28]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[0.42, -0.18, 0.28]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[0.42, -0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.35, 12]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── AESTHETIC WIREFRAME ORBIT RING (Subtle Aerospace Horizon) ── */}
      <mesh rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[2.5, 0.008, 8, 80]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-0.8, -0.4, 0]}>
        <torusGeometry args={[2.8, 0.005, 6, 80]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function DroneGlobe() {
  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing" style={{ minHeight: "440px" }}>
      <Canvas
        camera={{ position: [3.2, 2.4, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        {/* Lights for metallic reflection & depth */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 12, 8]} intensity={1.8} />
        <directionalLight position={[-6, -4, -6]} color="#0284c7" intensity={0.8} />
        <pointLight position={[0, 3, 0]} color="#38bdf8" intensity={1.4} distance={8} />

        {/* 3D Quadcopter Model */}
        <QuadcopterDrone />

        {/* 360° Interactive Orbit Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.9}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>

      {/* Tactile 360° Interaction Hint */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(56,189,248,0.75)",
          background: "rgba(8,10,18,0.65)",
          border: "1px solid rgba(56,189,248,0.20)",
          backdropFilter: "blur(12px)",
        }}
      >
        <svg
          className="w-3.5 h-3.5 animate-spin text-[#38bdf8]"
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
