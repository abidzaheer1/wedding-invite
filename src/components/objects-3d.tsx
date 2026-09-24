"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  type Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";

type Vec3 = [number, number, number];

/** Deterministic pseudo-random in [0,1) — pure, so it is safe during render. */
function rand(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const GOLD = "#e9c479";
const GOLD_DEEP = "#c9922f";
const ROSE = "#f0b8b0";
const ROSE_DEEP = "#d98a86";
const CREAM = "#f6e7d8";
const LEAF = "#7f9d78";

/**
 * A solitaire diamond ring: metal band, prong setting and a faceted
 * transmissive gem. Rendered as its own group so callers can place, scale and
 * spin it freely inside the scroll choreography.
 */
export function DiamondRing({
  bandColor = GOLD,
  gemColor = "#eaf6ff",
  spin = 0.35,
  ...props
}: {
  bandColor?: string;
  gemColor?: string;
  spin?: number;
} & React.ComponentProps<"group">) {
  const gem = useRef<Group>(null);

  useFrame((_, dt) => {
    if (gem.current) gem.current.rotation.y += dt * spin * 2.2;
  });

  return (
    <group {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.13, 64, 220]} />
        <meshStandardMaterial
          color={bandColor}
          metalness={1}
          roughness={0.16}
          envMapIntensity={2.2}
        />
      </mesh>

      <group position={[0, 1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.2, 0.14, 24]} />
          <meshStandardMaterial
            color={bandColor}
            metalness={1}
            roughness={0.22}
            envMapIntensity={2}
          />
        </mesh>

        <group ref={gem} position={[0, 0.26, 0]}>
          {/* crown — shallow faceted table narrowing upward */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.13, 0.3, 0.14, 8]} />
            <GemMaterial color={gemColor} />
          </mesh>
          {/* pavilion — faceted point aiming down */}
          <mesh position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.3, 0.44, 8]} />
            <GemMaterial color={gemColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Bright, faceted crystal material for gemstones. Uses flat shading for crisp
 * facets and enough emissive/clearcoat that it reads as a diamond even on
 * software renderers, while refracting the environment on real GPUs.
 */
function GemMaterial({ color = "#eaf6ff" }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.1}
      roughness={0.02}
      transmission={0.6}
      thickness={0.5}
      ior={2.4}
      clearcoat={1}
      clearcoatRoughness={0}
      iridescence={0.8}
      iridescenceIOR={1.6}
      envMapIntensity={3.5}
      emissive="#2b4d6b"
      emissiveIntensity={0.3}
      flatShading
    />
  );
}

/** A plain polished wedding band (no gem) used for the interlocking pair. */
export function Band({
  color = GOLD,
  ...props
}: { color?: string } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh>
        <torusGeometry args={[1, 0.12, 48, 200]} />
        <meshStandardMaterial
          color={color}
          metalness={1}
          roughness={0.18}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  );
}

/**
 * A stylised rose. `bloom` (0..1) opens the petals from a tight bud to a full
 * flower so the scroll choreography can make gardens blossom on cue.
 */
export function Flower({
  color = ROSE,
  coreColor = GOLD_DEEP,
  bloom = 1,
  petals = 7,
  seed = 0,
  ...props
}: {
  color?: string;
  coreColor?: string;
  bloom?: number;
  petals?: number;
  seed?: number;
} & React.ComponentProps<"group">) {
  const group = useRef<Group>(null);
  const phase = rand(seed + 1) * Math.PI * 2;
  const b = MathUtils.clamp(bloom, 0, 1);

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.rotation.y = Math.sin(t * 0.4 + phase) * 0.12;
    }
  });

  const ring1 = useMemo(() => Array.from({ length: petals }), [petals]);
  const ring2 = useMemo(() => Array.from({ length: petals }), [petals]);

  // Petals sit in the XY plane (facing +Z / the camera) and curl forward when
  // closed, opening flat as `bloom` -> 1.
  return (
    <group ref={group} {...props}>
      {ring1.map((_, i) => {
        const a = (i / petals) * Math.PI * 2;
        const tilt = -1.25 + b * 1.05;
        return (
          <group key={`o-${i}`} rotation={[0, 0, a]}>
            <group rotation={[tilt, 0, 0]}>
              <mesh position={[0, 0.34, 0.05]} scale={[0.3, 0.6, 0.12]}>
                <sphereGeometry args={[0.5, 18, 14]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.5}
                  side={DoubleSide}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      {ring2.map((_, i) => {
        const a = (i / petals) * Math.PI * 2 + Math.PI / petals;
        const tilt = -1.55 + b * 1.15;
        return (
          <group key={`i-${i}`} rotation={[0, 0, a]}>
            <group rotation={[tilt, 0, 0]}>
              <mesh position={[0, 0.22, 0.12]} scale={[0.22, 0.44, 0.11]}>
                <sphereGeometry args={[0.5, 16, 12]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.45}
                  side={DoubleSide}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      <mesh position={[0, 0, 0.12]}>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color={coreColor} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * A hand-tied bouquet: a cluster of blooms, greenery and a wrapped stem. It
 * accepts a `bloom` prop so it can assemble/open as the reader scrolls.
 */
export function Bouquet({
  bloom = 1,
  ...props
}: { bloom?: number } & React.ComponentProps<"group">) {
  const blossoms = useMemo(
    () =>
      [
        { p: [0, 0.35, 0] as Vec3, s: 0.72, c: ROSE, core: GOLD_DEEP },
        { p: [0.55, 0.15, 0.15] as Vec3, s: 0.6, c: CREAM, core: GOLD },
        { p: [-0.55, 0.18, 0.1] as Vec3, s: 0.62, c: ROSE_DEEP, core: GOLD_DEEP },
        { p: [0.28, 0.02, 0.5] as Vec3, s: 0.5, c: ROSE, core: GOLD },
        { p: [-0.32, -0.02, 0.48] as Vec3, s: 0.52, c: CREAM, core: GOLD_DEEP },
        { p: [0.02, -0.1, -0.5] as Vec3, s: 0.48, c: ROSE_DEEP, core: GOLD },
      ] satisfies { p: Vec3; s: number; c: string; core: string }[],
    []
  );

  const leaves = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { a, r: 0.85 + (i % 2) * 0.25 };
      }),
    []
  );

  return (
    <group {...props}>
      {leaves.map((l, i) => (
        <mesh
          key={`leaf-${i}`}
          position={[Math.cos(l.a) * l.r, -0.15, Math.sin(l.a) * l.r]}
          rotation={[Math.PI / 2.4, l.a, 0.4]}
          scale={[0.34, 0.9, 0.1]}
        >
          <sphereGeometry args={[0.5, 12, 10]} />
          <meshStandardMaterial color={LEAF} roughness={0.75} side={DoubleSide} />
        </mesh>
      ))}

      {blossoms.map((f, i) => (
        <Flower
          key={`b-${i}`}
          position={f.p}
          rotation={[-0.5 + f.p[1] * 0.3, f.p[0] * 0.5, 0]}
          scale={f.s}
          color={f.c}
          coreColor={f.core}
          bloom={bloom}
          petals={7}
          seed={i + 3}
        />
      ))}

      <mesh position={[0, -1.35, 0]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.16, 0.24, 2, 20]} />
        <meshStandardMaterial color="#e8dcc6" roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.35, 0]} rotation={[0, 0, 0.04]}>
        <torusGeometry args={[0.22, 0.05, 12, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * A drifting field of rose petals. Uses a single instanced mesh so hundreds of
 * petals cost one draw call while gently falling and swaying.
 */
export function PetalField({
  count = 140,
  area = 14,
  height = 16,
}: {
  count?: number;
  area?: number;
  height?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Matrix4(), []);
  const q = useMemo(() => new Quaternion(), []);
  const pos = useMemo(() => new Vector3(), []);
  const scl = useMemo(() => new Vector3(), []);
  const axis = useMemo(() => new Vector3(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: (rand(i * 7 + 1) - 0.5) * area,
        y: rand(i * 7 + 2) * height,
        z: (rand(i * 7 + 3) - 0.5) * area * 0.6,
        speed: 0.4 + rand(i * 7 + 4) * 0.9,
        sway: 0.5 + rand(i * 7 + 5) * 1.5,
        phase: rand(i * 7 + 6) * Math.PI * 2,
        spin: (rand(i * 7 + 7) - 0.5) * 2,
        size: 0.12 + rand(i * 7 + 8) * 0.16,
      })),
    [count, area, height]
  );

  const colors = useMemo(() => {
    const palette = [new Color(ROSE), new Color(CREAM), new Color(ROSE_DEEP)];
    return seeds.map((_, i) => palette[Math.floor(rand(i * 13 + 5) * palette.length)]);
  }, [seeds]);

  useFrame((state) => {
    const mref = mesh.current;
    if (!mref) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      let y = s.y - ((t * s.speed) % height);
      if (y < -height / 2) y += height;
      const x = s.x + Math.sin(t * s.sway + s.phase) * 0.8;
      const z = s.z + Math.cos(t * s.sway * 0.7 + s.phase) * 0.4;
      pos.set(x, y - height / 2 + height / 2, z);
      axis.set(Math.sin(s.phase), 1, Math.cos(s.phase)).normalize();
      q.setFromAxisAngle(axis, t * s.spin + s.phase);
      scl.set(s.size, s.size * 0.6, s.size);
      dummy.compose(pos, q, scl);
      mref.setMatrixAt(i, dummy);
      if (i < colors.length) mref.setColorAt(i, colors[i]);
    }
    mref.instanceMatrix.needsUpdate = true;
    if (mref.instanceColor) mref.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial roughness={0.6} side={DoubleSide} />
    </instancedMesh>
  );
}
