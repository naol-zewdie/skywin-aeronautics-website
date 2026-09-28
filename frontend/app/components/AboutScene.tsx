'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SafeCanvas from './SafeCanvas';

function pr(s: number): number { const x = Math.sin(s*9301+49297)*233280; return x-Math.floor(x); }

function CameraRig() {
  const { size } = useThree();
  const mouse = useRef({ x:0, y:0 });
  useEffect(() => {
    const h = (e: MouseEvent) => { mouse.current.x=(e.clientX/size.width-0.5)*2; mouse.current.y=-(e.clientY/size.height-0.5)*2; };
    window.addEventListener('mousemove',h);
    return () => window.removeEventListener('mousemove',h);
  }, [size]);
  useFrame((state) => {
    state.camera.position.x += (mouse.current.x*1.2 - state.camera.position.x)*0.03;
    state.camera.position.y += (mouse.current.y*0.7  - state.camera.position.y)*0.03;
    state.camera.lookAt(0,0,0);
  });
  return null;
}

function NodeNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 55;
  const nodes = useMemo(() => Array.from({length:COUNT},(_,i)=>({
    x:(pr(i*3)-0.5)*9, y:(pr(i*3+1)-0.5)*5, z:(pr(i*3+2)-0.5)*4-1,
    r:0.04+pr(i*7)*0.07,
  })),[]);

  const edges = useMemo(() => {
    const res=[], thr=2.8;
    for(let i=0;i<COUNT;i++) for(let j=i+1;j<COUNT;j++){
      const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,dz=nodes[i].z-nodes[j].z;
      const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if(d<thr) res.push([i,j]);
    }
    return res;
  },[nodes]);

  const lineGeo = useMemo(() => {
    const pts=[];
    for(const [i,j] of edges){ pts.push(nodes[i].x,nodes[i].y,nodes[i].z,nodes[j].x,nodes[j].y,nodes[j].z); }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));
    return g;
  },[edges,nodes]);

  // Dispose GPU-side geometry when the component unmounts or geometry changes
  useEffect(() => () => { lineGeo.dispose(); }, [lineGeo]);

  useFrame(() => {
    if(groupRef.current){
      const t = performance.now() * 0.001;
      groupRef.current.rotation.y = t * 0.055;
      groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color='#2e4566' transparent opacity={0.35} />
      </lineSegments>
      {nodes.map((n,i) => (
        <mesh key={i} position={[n.x,n.y,n.z]}>
          <sphereGeometry args={[n.r,8,8]} />
          <meshBasicMaterial color={i%5===0?'#6a7e98':i%3===0?'#45576D':'#23364F'} transparent opacity={0.75+pr(i)*0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const COUNT=200;
  const pos=useMemo(()=>{const a=new Float32Array(COUNT*3);for(let i=0;i<COUNT;i++){a[i*3]=(pr(i*3)-0.5)*20;a[i*3+1]=(pr(i*3+1)-0.5)*12;a[i*3+2]=(pr(i*3+2)-0.5)*8-4;}return a;},[]);
  return (<points><bufferGeometry><bufferAttribute attach='attributes-position' args={[pos,3]} /></bufferGeometry><pointsMaterial size={0.018} color='#8aaecb' transparent opacity={0.55} sizeAttenuation /></points>);
}

export default function AboutScene() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}} aria-hidden='true'>
      <SafeCanvas camera={{position:[0,0,7],fov:55}} gl={{antialias:true,alpha:true}} dpr={[1,1.5]}>
        <fog attach='fog' args={['#04060a',10,22]} />
        <ambientLight intensity={0.5} />
        <CameraRig />
        <Stars />
        <NodeNetwork />
      </SafeCanvas>
    </div>
  );
}