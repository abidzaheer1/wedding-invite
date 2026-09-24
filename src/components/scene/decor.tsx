"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  type InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  type PointLight,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { materials } from "./architecture";
import { Guest } from "./people";
import { rand, timeline, type Vec3 } from "./timeline";

const sphere = new SphereGeometry(1, 16, 12);
const petal = new SphereGeometry(0.5, 12, 10);
const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 16);
const ring = new TorusGeometry(1, 0.06, 10, 48);

export const bulbMaterial = new MeshStandardMaterial({
  color: "#fff1c8",
  emissive: "#ffcf7a",
  emissiveIntensity: 2.4,
  roughness: 0.4,
});
const flameMaterial = new MeshStandardMaterial({
  color: "#ffe6a8",
  emissive: "#ffb347",
  emissiveIntensity: 3,
});
const glassMaterial = new MeshStandardMaterial({
  color: "#ffe1a8",
  emissive: "#ffb85c",
  emissiveIntensity: 1.6,
  transparent: true,
  opacity: 0.85,
});

const petalMaterials = new Map<string, MeshStandardMaterial>();
function petalMat(color: string) {
  let m = petalMaterials.get(color);
  if (!m) {
    m = new MeshStandardMaterial({ color, roughness: 0.55, side: DoubleSide });
    petalMaterials.set(color, m);
  }
  return m;
}

/** Stylised rose — two rings of petals around a golden core. */
export function Flower({
  color = "#d9464f",
  coreColor = "#d4a94a",
  petals = 7,
  ...props
}: { color?: string; coreColor?: string; petals?: number } & React.ComponentProps<"group">) {
  const m = petalMat(color);
  const items = useMemo(() => Array.from({ length: petals }, (_, i) => i), [petals]);
  return (
    <group {...props}>
      {items.map((i) => (
        <group key={`o${i}`} rotation={[0, 0, (i / petals) * Math.PI * 2]}>
          <group rotation={[-0.35, 0, 0]}>
            <mesh geometry={petal} material={m} position={[0, 0.34, 0.05]} scale={[0.3, 0.6, 0.12]} />
          </group>
        </group>
      ))}
      {items.map((i) => (
        <group key={`i${i}`} rotation={[0, 0, (i / petals) * Math.PI * 2 + Math.PI / petals]}>
          <group rotation={[-0.55, 0, 0]}>
            <mesh geometry={petal} material={m} position={[0, 0.22, 0.12]} scale={[0.22, 0.44, 0.11]} />
          </group>
        </group>
      ))}
      <mesh geometry={sphere} material={petalMat(coreColor)} position={[0, 0, 0.12]} scale={0.14} />
    </group>
  );
}

const FLOWER_PALETTE = ["#c8102e", "#e8556a", "#f6e7d8", "#d4a94a", "#a61b3a", "#f2b8c6"];

/** Wall of blooms covering a rectangle in the local XY plane. */
export function FlowerWall({
  width,
  height,
  count = 36,
  seed = 0,
  scale = 0.6,
  ...props
}: { width: number; height: number; count?: number; seed?: number; scale?: number } & React.ComponentProps<"group">) {
  const blooms = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: [
          (rand(seed + i * 3) - 0.5) * width,
          (rand(seed + i * 5 + 1) - 0.5) * height,
          rand(seed + i * 7 + 2) * 0.15,
        ] as Vec3,
        rot: rand(seed + i * 11 + 3) * Math.PI * 2,
        color: FLOWER_PALETTE[Math.floor(rand(seed + i * 13 + 4) * FLOWER_PALETTE.length)],
        s: scale * (0.75 + rand(seed + i * 17 + 5) * 0.5),
      })),
    [count, height, scale, seed, width]
  );
  return (
    <group {...props}>
      {blooms.map((b, i) => (
        <Flower key={i} position={b.pos} rotation={[0, 0, b.rot]} scale={b.s} color={b.color} />
      ))}
    </group>
  );
}

/** Hanging gold chandelier; optionally carries a real point light. */
export function Chandelier({
  radius = 2,
  drop = 4,
  bulbs = 10,
  light,
  ...props
}: {
  radius?: number;
  drop?: number;
  bulbs?: number;
  light?: { intensity: number; distance: number };
} & React.ComponentProps<"group">) {
  const pl = useRef<PointLight>(null);
  const items = useMemo(() => Array.from({ length: bulbs }, (_, i) => (i / bulbs) * Math.PI * 2), [bulbs]);

  useFrame(() => {
    if (pl.current && light) {
      pl.current.intensity = light.intensity * (0.96 + Math.sin(timeline.elapsed * 3.3) * 0.04);
    }
  });

  return (
    <group {...props}>
      <mesh geometry={cylinder} material={materials.gold} position={[0, -drop / 2, 0]} scale={[0.05, drop, 0.05]} />
      <group position={[0, -drop, 0]}>
        <mesh geometry={ring} material={materials.gold} rotation={[Math.PI / 2, 0, 0]} scale={radius} />
        <mesh geometry={ring} material={materials.gold} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} scale={radius * 0.55} />
        {items.map((a, i) => (
          <group key={i}>
            <mesh geometry={cylinder} material={materials.gold} position={[Math.cos(a) * radius, 0.18, Math.sin(a) * radius]} scale={[0.04, 0.36, 0.04]} />
            <mesh geometry={sphere} material={bulbMaterial} position={[Math.cos(a) * radius, 0.48, Math.sin(a) * radius]} scale={0.14} />
          </group>
        ))}
        <mesh geometry={sphere} material={bulbMaterial} position={[0, -0.95, 0]} scale={0.22} />
        <mesh geometry={sphere} material={materials.gold} position={[0, -0.3, 0]} scale={[0.35, 0.5, 0.35]} />
        {light && (
          <pointLight ref={pl} position={[0, -0.4, 0]} intensity={light.intensity} distance={light.distance} decay={1.6} color="#ffd9a0" />
        )}
      </group>
    </group>
  );
}

/**
 * A sagging string of fairy lights between two points, rendered as a single
 * instanced mesh so hundreds of bulbs cost one draw call.
 */
export function FairyString({
  from,
  to,
  count = 40,
  sag = 1,
  size = 0.09,
}: {
  from: Vec3;
  to: Vec3;
  count?: number;
  sag?: number;
  size?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const p = new Vector3();
    const mat = new Matrix4();
    const scl = new Vector3(size, size, size);
    for (let i = 0; i < count; i++) {
      const s = i / (count - 1);
      p.lerpVectors(a, b, s);
      p.y -= sag * 4 * s * (1 - s);
      mat.compose(p, mesh.current!.quaternion, scl);
      m.setMatrixAt(i, mat);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, from, sag, size, to]);

  return (
    <instancedMesh ref={mesh} args={[sphere, bulbMaterial, count]} frustumCulled={false} />
  );
}

/** Garden lamp post with a glowing lantern head. */
export function Lantern({ height = 3.4, ...props }: { height?: number } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh geometry={cylinder} material={materials.stoneDark} position={[0, height / 2, 0]} scale={[0.07, height, 0.07]} />
      <mesh geometry={box} material={glassMaterial} position={[0, height + 0.3, 0]} scale={[0.42, 0.55, 0.42]} />
      <mesh geometry={box} material={materials.stoneDark} position={[0, height + 0.62, 0]} scale={[0.55, 0.08, 0.55]} />
      <mesh geometry={sphere} material={materials.gold} position={[0, height + 0.72, 0]} scale={0.08} />
    </group>
  );
}

/** Round banquet table with cloth, centrepiece, chiavari chairs and guests. */
export function BanquetTable({
  seed,
  guests = 4,
  ...props
}: { seed: number; guests?: number } & React.ComponentProps<"group">) {
  const seats = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + rand(seed) * 0.6;
        return { a, x: Math.cos(a) * 2.05, z: Math.sin(a) * 2.05, rotY: Math.atan2(-Math.cos(a), -Math.sin(a)) };
      }),
    [seed]
  );
  return (
    <group {...props}>
      <mesh material={materials.stone} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.76, 28]} />
      </mesh>
      <mesh geometry={cylinder} material={petalMat("#fbf6ee")} position={[0, 0.79, 0]} scale={[1.38, 0.06, 1.38]} />
      <mesh material={materials.gold} position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.08, 0.13, 0.34, 12]} />
      </mesh>
      <Flower position={[0, 1.22, 0.02]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5} color="#c8102e" />
      <Flower position={[0.14, 1.15, -0.12]} rotation={[-Math.PI / 2, 0, 0.6]} scale={0.38} color="#f6e7d8" />
      <mesh geometry={cylinder} material={petalMat("#fff6e0")} position={[0.5, 0.94, 0.3]} scale={[0.05, 0.28, 0.05]} />
      <mesh geometry={sphere} material={flameMaterial} position={[0.5, 1.12, 0.3]} scale={[0.04, 0.07, 0.04]} />
      {seats.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]}>
          <mesh geometry={box} material={materials.gold} position={[0, 0.46, 0]} scale={[0.46, 0.05, 0.46]} />
          <mesh geometry={box} material={materials.gold} position={[0, 0.74, -0.22]} scale={[0.46, 0.5, 0.04]} />
          {i < guests && <Guest seed={seed * 10 + i} style="hall" seated position={[0, 0.48, 0.02]} />}
        </group>
      ))}
    </group>
  );
}
