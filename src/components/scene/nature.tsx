"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  type Group,
  MeshStandardMaterial,
  SphereGeometry,
} from "three";
import { HALL_X, rand, smoothstep, timeline, type Vec3 } from "./timeline";

const puffGeometry = new SphereGeometry(1, 14, 10);
const cloudMaterial = new MeshStandardMaterial({
  color: "#ffffff",
  roughness: 1,
  emissive: new Color("#ffffff"),
  emissiveIntensity: 0.18,
});

type CloudSpec = {
  pos: Vec3;
  scale: number;
  seed: number;
  /** Hero clouds slide sideways on load to reveal the names. */
  part?: -1 | 1;
};

function puffsFor(seed: number) {
  const count = 6 + Math.floor(rand(seed) * 4);
  const puffs: { p: Vec3; r: number }[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1) - 0.5;
    const x = u * 6.5 + (rand(seed + i * 3) - 0.5) * 0.8;
    const y = (rand(seed + i * 7) - 0.4) * 1.2 * (1 - Math.abs(u) * 1.2);
    const z = (rand(seed + i * 11) - 0.5) * 2.2;
    const r = 1.4 + (1 - Math.abs(u) * 1.5) * 1.5 + rand(seed + i * 13) * 0.5;
    puffs.push({ p: [x, y, z], r: Math.max(0.9, r) });
  }
  return puffs;
}

function Cloud({ spec }: { spec: CloudSpec }) {
  const group = useRef<Group>(null);
  const puffs = useMemo(() => puffsFor(spec.seed), [spec.seed]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const drift = Math.sin(timeline.elapsed * 0.05 + spec.seed) * 2.5;
    const reveal = spec.part
      ? spec.part * smoothstep(0.4, 3.6, timeline.elapsed) * 13
      : 0;
    // Scrolling away from the hero pulls the parted clouds even further out.
    const scrollPart = spec.part ? spec.part * smoothstep(0, 0.6, timeline.t) * 18 : 0;
    g.position.x = spec.pos[0] + drift + reveal + scrollPart;
    g.position.y = spec.pos[1] + Math.sin(timeline.elapsed * 0.13 + spec.seed) * 0.6;
  });

  return (
    <group ref={group} position={spec.pos} scale={spec.scale}>
      {puffs.map((p, i) => (
        <mesh
          key={i}
          geometry={puffGeometry}
          material={cloudMaterial}
          position={p.p}
          scale={[p.r, p.r * 0.78, p.r]}
        />
      ))}
    </group>
  );
}

const CLOUDS: CloudSpec[] = [
  // Hero pair that parts to reveal the names
  { pos: [-15, 55.5, 18], scale: 1.7, seed: 1, part: -1 },
  { pos: [15, 56.5, 17], scale: 1.6, seed: 2, part: 1 },
  { pos: [-4, 50, 12], scale: 1.1, seed: 3, part: -1 },
  { pos: [6, 62, 10], scale: 1.0, seed: 4, part: 1 },
  // Surrounding sky
  { pos: [-42, 60, -20], scale: 2.2, seed: 5 },
  { pos: [44, 58, -30], scale: 2.4, seed: 6 },
  { pos: [-24, 68, -60], scale: 2.8, seed: 7 },
  { pos: [22, 66, -75], scale: 3.0, seed: 8 },
  { pos: [0, 72, -110], scale: 3.6, seed: 9 },
  { pos: [-70, 64, -90], scale: 3.2, seed: 10 },
  { pos: [72, 62, -80], scale: 3.1, seed: 11 },
  { pos: [-52, 52, 40], scale: 2.0, seed: 12 },
  { pos: [58, 54, 45], scale: 2.1, seed: 13 },
  { pos: [-100, 70, -160], scale: 4.2, seed: 14 },
  { pos: [110, 74, -170], scale: 4.4, seed: 15 },
  { pos: [-10, 78, -200], scale: 4.8, seed: 16 },
  { pos: [40, 66, -140], scale: 3.4, seed: 17 },
  // Low deck beneath the opening shot so the ground reads as distant haze
  { pos: [-30, 44, 30], scale: 2.6, seed: 21 },
  { pos: [28, 42, 34], scale: 2.4, seed: 22 },
  { pos: [-2, 40, 8], scale: 3.0, seed: 23 },
  { pos: [-60, 46, -10], scale: 3.2, seed: 24 },
  { pos: [62, 45, -6], scale: 3.0, seed: 25 },
  { pos: [-20, 43, -40], scale: 3.4, seed: 26 },
  { pos: [26, 41, -45], scale: 3.2, seed: 27 },
  { pos: [-90, 48, 20], scale: 3.6, seed: 28 },
  { pos: [92, 47, 24], scale: 3.4, seed: 29 },
  { pos: [12, 37, 22], scale: 2.6, seed: 30 },
  // A few over the hall so its night sky is not empty
  { pos: [HALL_X - 60, 66, -120], scale: 3.4, seed: 18 },
  { pos: [HALL_X + 50, 70, -150], scale: 3.8, seed: 19 },
  { pos: [HALL_X + 10, 62, -95], scale: 2.6, seed: 20 },
];

/** Low-poly cloud layer that hosts the opening scene. */
export function Clouds() {
  useFrame(() => {
    // Clouds catch the sunset then dim to silhouettes at night.
    const n = timeline.night;
    cloudMaterial.color.setRGB(1 - n * 0.75, 1 - n * 0.78, 1 - n * 0.72);
    cloudMaterial.emissiveIntensity = 0.18 * (1 - n);
  });
  return (
    <group>
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} spec={c} />
      ))}
    </group>
  );
}

const trunkGeometry = new CylinderGeometry(0.22, 0.34, 1, 8);
const trunkMaterial = new MeshStandardMaterial({ color: "#6b4a2f", roughness: 0.95 });
const canopyGeometry = new SphereGeometry(1, 10, 8);
const canopyMaterials = [
  new MeshStandardMaterial({ color: "#4f8a4a", roughness: 0.9, flatShading: true }),
  new MeshStandardMaterial({ color: "#6aa35a", roughness: 0.9, flatShading: true }),
  new MeshStandardMaterial({ color: "#3f7a44", roughness: 0.9, flatShading: true }),
];

/** Round leafy tree. */
export function Tree({
  seed = 0,
  height = 5,
  ...props
}: { seed?: number; height?: number } & React.ComponentProps<"group">) {
  const canopy = canopyMaterials[seed % canopyMaterials.length];
  const r = height * 0.42;
  return (
    <group {...props}>
      <mesh
        geometry={trunkGeometry}
        material={trunkMaterial}
        position={[0, height * 0.3, 0]}
        scale={[1, height * 0.6, 1]}
      />
      <mesh geometry={canopyGeometry} material={canopy} position={[0, height * 0.62, 0]} scale={[r, r * 1.05, r]} />
      <mesh
        geometry={canopyGeometry}
        material={canopy}
        position={[r * 0.55, height * 0.5, r * 0.3]}
        scale={[r * 0.7, r * 0.7, r * 0.7]}
      />
      <mesh
        geometry={canopyGeometry}
        material={canopy}
        position={[-r * 0.5, height * 0.55, -r * 0.3]}
        scale={[r * 0.65, r * 0.65, r * 0.65]}
      />
    </group>
  );
}

const frondGeometry = new ConeGeometry(0.55, 3.4, 5);
const frondMaterial = new MeshStandardMaterial({ color: "#3f8a4f", roughness: 0.85, flatShading: true });
const palmTrunkMaterial = new MeshStandardMaterial({ color: "#8a6a45", roughness: 0.95 });

/** Leaning palm with radiating fronds. */
export function PalmTree({
  seed = 0,
  height = 8,
  ...props
}: { seed?: number; height?: number } & React.ComponentProps<"group">) {
  const lean = (rand(seed) - 0.5) * 0.35;
  const fronds = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        angle: (i / 8) * Math.PI * 2 + rand(seed + i) * 0.4,
        tilt: 0.85 + rand(seed + i * 5) * 0.35,
      })),
    [seed]
  );
  return (
    <group {...props} rotation={[0, 0, lean]}>
      <mesh material={palmTrunkMaterial} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.28, 0.42, height, 8]} />
      </mesh>
      <group position={[0, height, 0]}>
        <mesh material={frondMaterial}>
          <sphereGeometry args={[0.6, 8, 6]} />
        </mesh>
        {fronds.map((f, i) => (
          <group key={i} rotation={[0, f.angle, 0]}>
            <mesh
              geometry={frondGeometry}
              material={frondMaterial}
              position={[Math.sin(f.tilt) * 1.7, Math.cos(f.tilt) * 1.7 - 0.4, 0]}
              rotation={[0, 0, -f.tilt]}
              scale={[1, 1, 0.35]}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Planting around both venues. */
export function Greenery() {
  const trees = useMemo(() => {
    const list: { pos: Vec3; seed: number; h: number; palm: boolean }[] = [];
    const around = (cx: number, palms: boolean) => {
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + rand(i + cx) * 0.3;
        const r = 40 + rand(i * 3 + cx) * 30;
        const x = cx + Math.cos(a) * r;
        const z = Math.sin(a) * r * 0.9 - 4;
        if (z > 24 && Math.abs(x - cx) < 12) continue; // keep the approach path clear
        list.push({ pos: [x, 0, z], seed: i + cx, h: 4.5 + rand(i * 7 + cx) * 3, palm: palms && i % 3 === 0 });
      }
    };
    around(0, true);
    around(HALL_X, true);
    return list;
  }, []);

  return (
    <group>
      {trees.map((t, i) =>
        t.palm ? (
          <PalmTree key={i} position={t.pos} seed={t.seed} height={t.h + 3} />
        ) : (
          <Tree key={i} position={t.pos} seed={t.seed} height={t.h} />
        )
      )}
      {/* Courtyard palms */}
      <PalmTree position={[-13, 1, 20]} seed={101} height={9} />
      <PalmTree position={[13, 1, 21]} seed={102} height={8.5} />
      <PalmTree position={[-21, 1, 32]} seed={103} height={8} />
      <PalmTree position={[21, 1, 33]} seed={104} height={9.5} />
      {/* Hall driveway palms */}
      <PalmTree position={[HALL_X - 14, 1, 22]} seed={201} height={9} />
      <PalmTree position={[HALL_X + 14, 1, 22]} seed={202} height={9} />
      <PalmTree position={[HALL_X - 22, 1, 34]} seed={203} height={8} />
      <PalmTree position={[HALL_X + 22, 1, 34]} seed={204} height={8.5} />
    </group>
  );
}
