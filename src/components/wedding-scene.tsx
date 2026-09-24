"use client";

import { ContactShadows, Environment, Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

function WeddingBand() {
  const ring = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (ring.current) {
      ring.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.25;
      ring.current.rotation.y += delta * 0.22;
      ring.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.12;
    }
  });

  return (
    <group rotation={[0.3, -0.35, 0.2]}>
      <mesh ref={ring}>
        <torusGeometry args={[1.28, 0.14, 32, 96]} />
        <meshPhysicalMaterial color="#e4b56f" metalness={1} roughness={0.14} clearcoat={1} clearcoatRoughness={0.06} />
      </mesh>
      <mesh position={[0, 1.27, 0]} scale={[0.24, 0.33, 0.24]} rotation={[0, 0, Math.PI / 4]}>
        <icosahedronGeometry args={[0.46, 1]} />
        <meshPhysicalMaterial color="#edf7f4" transmission={0.75} thickness={0.7} roughness={0.04} ior={2.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, 1.19, 0]}>
        <torusGeometry args={[0.29, 0.035, 16, 32]} />
        <meshStandardMaterial color="#f5d49d" metalness={1} roughness={0.12} />
      </mesh>
    </group>
  );
}

function Flower({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  const flower = useRef<Group>(null);

  useFrame((state) => {
    if (flower.current) {
      flower.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.06;
    }
  });

  const petals = Array.from({ length: 6 });
  return (
    <group ref={flower} position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, -0.9, 0]} rotation={[0.1, 0.2, 0.2]}>
        <cylinderGeometry args={[0.025, 0.045, 1.8, 8]} />
        <meshStandardMaterial color="#718f73" roughness={0.8} />
      </mesh>
      {petals.map((_, index) => {
        const angle = (index / petals.length) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.27, 0, Math.sin(angle) * 0.27]} rotation={[0, angle, 0.35]} scale={[0.25, 0.11, 0.48]}>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshPhysicalMaterial color={index % 2 ? "#edb6a9" : "#f5d6c5"} roughness={0.5} clearcoat={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color="#d79a56" roughness={0.35} />
      </mesh>
    </group>
  );
}

function FloatingObjects() {
  const firstRing = useRef<Mesh>(null);
  const secondRing = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (firstRing.current) {
      firstRing.current.rotation.x += delta * 0.16;
      firstRing.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.28;
    }
    if (secondRing.current) {
      secondRing.current.rotation.x -= delta * 0.12;
      secondRing.current.rotation.z += delta * 0.18;
    }
  });

  return (
    <>
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.65}>
        <group ref={firstRing} position={[0.8, 0.05, 0]} scale={1.12}>
          <WeddingBand />
        </group>
      </Float>
      <Float speed={0.9} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={secondRing} position={[-1.15, 0.65, -0.6]} scale={0.8}>
          <WeddingBand />
        </group>
      </Float>
      <Float speed={0.65} rotationIntensity={0.12} floatIntensity={0.45}><Flower position={[-2.2, 1.2, 0]} scale={0.8} rotation={[0.15, -0.3, -0.25]} /></Float>
      <Float speed={0.75} rotationIntensity={0.16} floatIntensity={0.5}><Flower position={[2.15, -1.05, -0.3]} scale={0.72} rotation={[-0.2, 0.4, 0.4]} /></Float>
      <Float speed={0.8} rotationIntensity={0.16} floatIntensity={0.4}><Flower position={[2.25, 1.3, -0.7]} scale={0.48} rotation={[0.3, -0.4, -0.3]} /></Float>
    </>
  );
}

export function WeddingScene() {
  return (
    <div className="scene-shell" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5.8], fov: 38 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#101c24"]} />
        <fog attach="fog" args={["#101c24", 5, 9]} />
        <ambientLight intensity={1.2} />
        <pointLight position={[3, 2, 4]} intensity={16} color="#e2ad72" distance={7} />
        <pointLight position={[-3, -1, 2]} intensity={10} color="#68808b" distance={6} />
        <FloatingObjects />
        <Sparkles count={80} scale={5.5} size={2} speed={0.25} color="#f4d9ae" />
        <Environment preset="city" environmentIntensity={0.35} />
        <ContactShadows position={[0, -1.8, 0]} opacity={0.35} scale={7} blur={2.5} far={4} />
        <EffectComposer>
          <Bloom luminanceThreshold={1.2} intensity={0.45} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}