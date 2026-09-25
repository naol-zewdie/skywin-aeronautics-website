'use client';
import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function pr(s: number): number { const x=Math.sin(s*9301+49297)*233280; return x-Math.floor(x); }

function RadarBase() {
  const rings=[0.8,1.6,2.4,3.2];
  const lineGeos = useMemo(()=>{
    return [0,1].map(axis=>{
      const pts=axis===0?new Float32Array([-3.2,0,0,3.2,0,0]):new Float32Array([0,-3.2,0,0,3.2,0]);
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(pts,3));
      return g;
    });
  },[]);
  return (
    <group rotation={[-Math.PI/2,0,0]}>
      <mesh>
        <cylinderGeometry args={[3.2,3.2,0.015,64]} />
        <meshStandardMaterial color='#07111f' transparent opacity={0.85} metalness={0.8} roughness={0.4} />
      </mesh>
      {rings.map((r,i)=>(<mesh key={i}><torusGeometry args={[r,0.008,6,80]} /><meshBasicMaterial color='#1a3050' transparent opacity={0.5-i*0.08} /></mesh>))}
      {lineGeos.map((geo,i)=>(<lineSegments key={i} geometry={geo}><lineBasicMaterial color='#1a3050' transparent opacity={0.4} /></lineSegments>))}
    </group>
  );
}

function RadarSweep() {
  const groupRef=useRef<THREE.Group>(null);
  const angleRef=useRef(0);
  const BLIP_COUNT=12;

  const blips=useMemo(()=>Array.from({length:BLIP_COUNT},(_,i)=>({
    angle:pr(i*3)*Math.PI*2,
    radius:0.4+pr(i*3+1)*2.6,
  })),[]);

  const sweepGeo=useMemo(()=>{
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,0,0,3.15,0,0]),3));
    return g;
  },[]);

  const wedgeGeos=useMemo(()=>Array.from({length:18},(_,i)=>{
    const a=-(i/18)*(Math.PI/2.5);
    const r=3.15;
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([
      0,0,0,
      Math.cos(a)*r,0,Math.sin(a)*r,
      Math.cos(a-0.12)*r,0,Math.sin(a-0.12)*r
    ]),3));
    return {geo:g, opacity:(1-i/18)*0.06};
  }),[]);

  const blipMeshRefs=useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_,delta)=>{
    angleRef.current=(angleRef.current+delta*1.1)%(Math.PI*2);
    if(groupRef.current) groupRef.current.rotation.y=angleRef.current;
    blips.forEach((b,i)=>{
      const mesh=blipMeshRefs.current[i];
      if(!mesh) return;
      const diff=((b.angle-angleRef.current)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      const age=diff/(Math.PI*2);
      const alpha=age<0.05?1.0:Math.max(0,1-age*3.5);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity=alpha*0.95;
      mesh.visible=alpha>0.01;
    });
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={sweepGeo}><lineBasicMaterial color='#30e8a0' transparent opacity={0.95} /></lineSegments>
      {wedgeGeos.map((w,i)=>(<mesh key={i} geometry={w.geo}><meshBasicMaterial color='#18c984' transparent opacity={w.opacity} side={THREE.DoubleSide} /></mesh>))}
      {blips.map((b,i)=>(
        <mesh key={i} ref={el=>{ blipMeshRefs.current[i]=el; }} position={[Math.cos(b.angle)*b.radius,0.01,Math.sin(b.angle)*b.radius]}>
          <sphereGeometry args={[0.07,8,8]} />
          <meshBasicMaterial color='#45c9a0' transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const COUNT=120;
  const pos=useMemo(()=>{const a=new Float32Array(COUNT*3);for(let i=0;i<COUNT;i++){a[i*3]=(pr(i*3)-0.5)*12;a[i*3+1]=pr(i*3+1)*4;a[i*3+2]=(pr(i*3+2)-0.5)*8-2;}return a;},[]);
  const ref=useRef<THREE.Points>(null);
  useFrame((state)=>{ if(ref.current) ref.current.rotation.y=state.clock.elapsedTime*0.015; });
  return (<points ref={ref}><bufferGeometry><bufferAttribute attach='attributes-position' args={[pos,3]} /></bufferGeometry><pointsMaterial size={0.022} color='#5a8aaa' transparent opacity={0.5} sizeAttenuation /></points>);
}

export default function ServicesScene() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}} aria-hidden='true'>
      <Canvas camera={{position:[0,5.5,4.5],fov:50}} gl={{antialias:true,alpha:true}} dpr={[1,1.5]}>
        <fog attach='fog' args={['#04060a',12,24]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0,4,0]} color='#18c984' intensity={1.2} distance={10} />
        <ParticleField />
        <RadarBase />
        <RadarSweep />
      </Canvas>
    </div>
  );
}