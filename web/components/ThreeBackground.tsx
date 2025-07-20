"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 5000 }) {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      temp[i3] = (Math.random() - 0.5) * 100;
      temp[i3 + 1] = (Math.random() - 0.5) * 100;
      temp[i3 + 2] = (Math.random() - 0.5) * 100;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Points ref={mesh} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4f46e5"
        size={0.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingCubes() {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.2;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={mesh}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#4f46e5" : "#7c3aed"} 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Particles />
        <FloatingCubes />
      </Canvas>
    </div>
  );
}