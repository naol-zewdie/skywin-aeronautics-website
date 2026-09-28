'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SafeCanvas from './SafeCanvas';

function pr(s: number): number { const x=Math.sin(s*9301+49297)*233280; return x-Math.floor(x); }

// Slow-rotating star backdrop
function Stars() {
  const COUNT=240;
  const pos=useMemo(()=>{const a=new Float32Array(COUNT*3);for(let i=0;i<COUNT;i++){a[i*3]=(pr(i*3)-0.5)*22;a[i*3+1]=(pr(i*3+1)-0.5)*14;a[i*3+2]=(pr(i*3+2)-0.5)*10-3;}return a;},[]);
  const ref=useRef<THREE.Points>(null);
  useFrame(()=>{ if(ref.current) ref.current.rotation.y = performance.now() * 0.001 * 0.018; });
  return (<points ref={ref}><bufferGeometry><bufferAttribute attach='attributes-position' args={[pos,3]} /></bufferGeometry><pointsMaterial size={0.020} color='#8aaecb' transparent opacity={0.6} sizeAttenuation /></points>);
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
      </SafeCanvas>
    </div>
  );
}