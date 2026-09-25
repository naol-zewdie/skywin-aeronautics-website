'use client';
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SafeCanvas from './SafeCanvas';

function pr(s: number): number { const x=Math.sin(s*9301+49297)*233280; return x-Math.floor(x); }

// Pulsing nucleus
function Nucleus() {
  const meshRef=useRef<THREE.Mesh>(null);
  const glowRef=useRef<THREE.Mesh>(null);
  useFrame(()=>{
    const t = performance.now() * 0.001;
    const pulse=0.95+Math.sin(t*2.2)*0.07;
    if(meshRef.current) meshRef.current.scale.setScalar(pulse);
    if(glowRef.current) {
      glowRef.current.scale.setScalar(1.4+Math.sin(t*1.8)*0.12);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity=0.12+Math.sin(t*2.2)*0.04;
    }
  });
  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55,32,32]} />
        <meshBasicMaterial color='#45576D' transparent opacity={0.18} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.32,32,32]} />
        <meshStandardMaterial color='#23364F' emissive='#45576D' emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

interface OrbitalRingProps {
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  speed: number;
  radius: number;
  color: string;
  electronColor: string;
}

// Single orbital ring with a travelling electron
function OrbitalRing({ tiltX, tiltY, tiltZ, speed, radius, color, electronColor }: OrbitalRingProps) {
  const electronRef=useRef<THREE.Mesh>(null);
  const angleRef=useRef(0);
  useFrame((_,delta)=>{
    angleRef.current+=delta*speed;
    if(electronRef.current){
      electronRef.current.position.x=Math.cos(angleRef.current)*radius;
      electronRef.current.position.z=Math.sin(angleRef.current)*radius;
    }
  });
  return (
    <group rotation={[tiltX,tiltY,tiltZ]}>
      <mesh>
        <torusGeometry args={[radius,0.012,8,80]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.075,12,12]} />
        <meshStandardMaterial color={electronColor} emissive={electronColor} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

interface AccentRingProps {
  tiltX: number;
  tiltZ: number;
  radius: number;
  speed: number;
}

// Outer accent ring (slow, no electron)
function AccentRing({ tiltX, tiltZ, radius, speed }: AccentRingProps) {
  const ref=useRef<THREE.Mesh>(null);
  useFrame((_,delta)=>{ if(ref.current) ref.current.rotation.y+=delta*speed; });
  return (
    <mesh ref={ref} rotation={[tiltX,0,tiltZ]}>
      <torusGeometry args={[radius,0.006,6,80]} />
      <meshBasicMaterial color='#23364F' transparent opacity={0.25} />
    </mesh>
  );
}

// Slow-rotating star backdrop
function Stars() {
  const COUNT=240;
  const pos=useMemo(()=>{const a=new Float32Array(COUNT*3);for(let i=0;i<COUNT;i++){a[i*3]=(pr(i*3)-0.5)*22;a[i*3+1]=(pr(i*3+1)-0.5)*14;a[i*3+2]=(pr(i*3+2)-0.5)*10-3;}return a;},[]);
  const ref=useRef<THREE.Points>(null);
  useFrame(()=>{ if(ref.current) ref.current.rotation.y = performance.now() * 0.001 * 0.018; });
  return (<points ref={ref}><bufferGeometry><bufferAttribute attach='attributes-position' args={[pos,3]} /></bufferGeometry><pointsMaterial size={0.020} color='#8aaecb' transparent opacity={0.6} sizeAttenuation /></points>);
}

// Slowly bobbing whole scene
function AtomGroup() {
  const ref=useRef<THREE.Group>(null);
  useFrame(()=>{
    if(ref.current){
      const t = performance.now() * 0.001;
      ref.current.rotation.y = t * 0.06;
      ref.current.position.y = Math.sin(t * 0.5) * 0.08;
    }
  });
  return (
    <group ref={ref}>
      <Nucleus />
      <OrbitalRing tiltX={0}      tiltY={0} tiltZ={0}    speed={1.4} radius={1.2} color='#45576D' electronColor='#ffffff' />
      <OrbitalRing tiltX={1.1}    tiltY={0} tiltZ={0.4}  speed={0.9} radius={1.6} color='#45576D' electronColor='#6a7e98' />
      <OrbitalRing tiltX={-0.6}   tiltY={0} tiltZ={1.2}  speed={1.7} radius={1.0} color='#23364F' electronColor='#6a7e98' />
      <AccentRing  tiltX={0.4}    tiltZ={0.6}  radius={2.2} speed={0.12} />
      <AccentRing  tiltX={-0.8}   tiltZ={-0.3} radius={2.7} speed={0.08} />
    </group>
  );
}

export default function ProductsScene() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}} aria-hidden='true'>
      <SafeCanvas camera={{position:[0,1.5,5.5],fov:52}} gl={{antialias:true,alpha:true}} dpr={[1,1.5]}>
        <fog attach='fog' args={['#04060a',10,20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[3,4,3]}  color='#45576D' intensity={1.5} distance={12} />
        <pointLight position={[-3,-2,2]} color='#23364F' intensity={0.8} distance={10} />
        <Stars />
        <AtomGroup />
      </SafeCanvas>
    </div>
  );
}