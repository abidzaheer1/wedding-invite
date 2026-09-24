"use client";

import { useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Path,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
} from "three";

export type ArchStyle = "pointed" | "round";

export const materials = {
  stone: new MeshStandardMaterial({ color: "#f3e8d4", roughness: 0.9 }),
  stoneTrim: new MeshStandardMaterial({ color: "#e3d2b0", roughness: 0.85 }),
  stoneDark: new MeshStandardMaterial({ color: "#8a6e4a", roughness: 0.95 }),
  sandstone: new MeshStandardMaterial({ color: "#d9c4a0", roughness: 0.9 }),
  paving: new MeshStandardMaterial({ color: "#d6c9b3", roughness: 1 }),
  dome: new MeshStandardMaterial({ color: "#2f8a7d", roughness: 0.45, metalness: 0.1 }),
  tile: new MeshStandardMaterial({ color: "#1f6f68", roughness: 0.5 }),
  gold: new MeshStandardMaterial({ color: "#d4a94a", metalness: 0.9, roughness: 0.28 }),
  wood: new MeshStandardMaterial({ color: "#6b4a2f", roughness: 0.8 }),
  niche: new MeshStandardMaterial({ color: "#5a4632", roughness: 1 }),
  mihrab: new MeshStandardMaterial({ color: "#1c5a56", roughness: 0.6 }),
};

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 24);
const octagon = new CylinderGeometry(1, 1, 1, 8);
const hemisphere = new SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
const sphere = new SphereGeometry(1, 20, 14);
const crescent = new TorusGeometry(1, 0.14, 8, 24, Math.PI * 1.35);

/** Adds an arch outline (base at y=0, centred on x=0) to `path`. */
function traceArch(path: Path, w: number, h: number, style: ArchStyle, ox = 0) {
  if (style === "round") {
    const y0 = h - w / 2;
    path.moveTo(ox - w / 2, 0);
    path.lineTo(ox - w / 2, y0);
    path.absarc(ox, y0, w / 2, Math.PI, 0, true);
    path.lineTo(ox + w / 2, 0);
    path.closePath();
    return;
  }
  // Equilateral pointed arch: two arcs of radius w centred on the opposite springers.
  const y0 = h - (w * Math.sqrt(3)) / 2;
  path.moveTo(ox - w / 2, 0);
  path.lineTo(ox - w / 2, y0);
  path.absarc(ox + w / 2, y0, w, Math.PI, (Math.PI * 2) / 3, true);
  path.absarc(ox - w / 2, y0, w, Math.PI / 3, 0, true);
  path.lineTo(ox + w / 2, 0);
  path.closePath();
}

export function archShape(w: number, h: number, style: ArchStyle) {
  const s = new Shape();
  traceArch(s, w, h, style);
  return s;
}

/**
 * Solid wall with an arched opening cut through it. Origin at the bottom
 * centre of the wall; the wall lies in the XY plane and is `depth` thick in Z.
 */
export function WallWithArch({
  width,
  height,
  depth = 0.6,
  arch,
  style = "pointed",
  material = materials.stone,
  ...props
}: {
  width: number;
  height: number;
  depth?: number;
  arch: { width: number; height: number; x?: number };
  style?: ArchStyle;
  material?: MeshStandardMaterial;
} & React.ComponentProps<"mesh">) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(width / 2, height);
    shape.lineTo(-width / 2, height);
    shape.closePath();
    const hole = new Path();
    traceArch(hole, arch.width, arch.height, style, arch.x ?? 0);
    shape.holes.push(hole);
    const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [width, height, depth, arch.width, arch.height, arch.x, style]);

  return <mesh geometry={geometry} material={material} {...props} />;
}

/** Flat filled arch — a shaded niche or a lit window. */
export function ArchPanel({
  width,
  height,
  style = "pointed",
  material = materials.niche,
  ...props
}: {
  width: number;
  height: number;
  style?: ArchStyle;
  material?: MeshStandardMaterial;
} & React.ComponentProps<"mesh">) {
  const geometry = useMemo(() => new ShapeGeometry(archShape(width, height, style)), [width, height, style]);
  return <mesh geometry={geometry} material={material} {...props} />;
}

/** Flat arch-shaped border (outer arch minus inner arch). */
export function ArchFrame({
  width,
  height,
  thickness = 0.3,
  style = "pointed",
  material = materials.stoneTrim,
  ...props
}: {
  width: number;
  height: number;
  thickness?: number;
  style?: ArchStyle;
  material?: MeshStandardMaterial;
} & React.ComponentProps<"mesh">) {
  const geometry = useMemo(() => {
    const outer = archShape(width + thickness * 2, height + thickness, style);
    const inner = new Path();
    traceArch(inner, width, height, style);
    outer.holes.push(inner);
    return new ShapeGeometry(outer);
  }, [width, height, thickness, style]);
  return <mesh geometry={geometry} material={material} {...props} />;
}

/** Drum + onion dome + gold finial with crescent. Origin at the drum base. */
export function Dome({
  radius,
  drumHeight = radius * 0.22,
  material = materials.dome,
  ...props
}: { radius: number; drumHeight?: number; material?: MeshStandardMaterial } & React.ComponentProps<"group">) {
  const finialBase = drumHeight + radius * 1.12;
  return (
    <group {...props}>
      <mesh geometry={cylinder} material={materials.stone} position={[0, drumHeight / 2, 0]} scale={[radius * 1.02, drumHeight, radius * 1.02]} />
      <mesh geometry={hemisphere} material={material} position={[0, drumHeight, 0]} scale={[radius, radius * 1.12, radius]} />
      <mesh geometry={cylinder} material={materials.gold} position={[0, finialBase + radius * 0.12, 0]} scale={[radius * 0.06, radius * 0.24, radius * 0.06]} />
      <mesh geometry={sphere} material={materials.gold} position={[0, finialBase + radius * 0.27, 0]} scale={radius * 0.09} />
      <mesh
        geometry={crescent}
        material={materials.gold}
        position={[0, finialBase + radius * 0.42, 0]}
        rotation={[0, 0, Math.PI * 0.82]}
        scale={radius * 0.1}
      />
    </group>
  );
}

/** Slender tower with balcony and domed cap. Origin at the base. */
export function Minaret({
  height = 27,
  ...props
}: { height?: number } & React.ComponentProps<"group">) {
  const shaft = height * 0.72;
  return (
    <group {...props}>
      <mesh geometry={octagon} material={materials.stoneTrim} position={[0, 1.6, 0]} scale={[1.7, 3.2, 1.7]} />
      <mesh geometry={cylinder} material={materials.stone} position={[0, 3.2 + shaft / 2, 0]} scale={[1.15, shaft, 1.15]} />
      <mesh geometry={octagon} material={materials.stoneTrim} position={[0, 3.2 + shaft, 0]} scale={[2.1, 0.55, 2.1]} />
      <mesh geometry={cylinder} material={materials.tile} position={[0, 3.2 + shaft - 0.9, 0]} scale={[1.2, 0.5, 1.2]} />
      <mesh geometry={cylinder} material={materials.stone} position={[0, 3.2 + shaft + 0.5 + (height - shaft - 3.2 - 0.5) / 2, 0]} scale={[0.85, height - shaft - 3.7, 0.85]} />
      <Dome radius={1.2} drumHeight={0.3} position={[0, height, 0]} />
    </group>
  );
}

/** Row of merlons along a parapet edge, laid out along local X. */
export function Crenellation({
  length,
  spacing = 1.6,
  size = 0.7,
  material = materials.stoneTrim,
  ...props
}: { length: number; spacing?: number; size?: number; material?: MeshStandardMaterial } & React.ComponentProps<"group">) {
  const count = Math.floor(length / spacing);
  const items = useMemo(() => Array.from({ length: count }, (_, i) => -length / 2 + spacing / 2 + i * spacing), [count, length, spacing]);
  return (
    <group {...props}>
      {items.map((x) => (
        <group key={x}>
          <mesh geometry={box} material={material} position={[x, size / 2, 0]} scale={[size, size, size * 0.8]} />
          <mesh geometry={sphere} material={material} position={[x, size, 0]} scale={size * 0.4} />
        </group>
      ))}
    </group>
  );
}
