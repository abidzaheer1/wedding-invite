"use client";

import { useMemo } from "react";
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from "three";
import {
  ArchFrame,
  ArchPanel,
  Crenellation,
  Dome,
  Minaret,
  WallWithArch,
  materials,
} from "./architecture";
import { Chandelier, Flower } from "./decor";
import { Guest, Person } from "./people";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 20);
const carpet = new MeshStandardMaterial({ color: "#7a1f2b", roughness: 1 });
const carpetStripe = new MeshStandardMaterial({ color: "#c9a25a", roughness: 0.9 });
const cushion = new MeshStandardMaterial({ color: "#a31d3a", roughness: 0.9 });
const water = new MeshStandardMaterial({ color: "#5fb6d6", roughness: 0.15, metalness: 0.2, emissive: "#1a4a5c", emissiveIntensity: 0.3 });

/** Mosque footprint: x ∈ [-18, 18], z ∈ [-16, 10], walls y ∈ [1, 11]. */
const W = 36;
const D = 26;
const H = 10;
const FLOOR = 1;

export function Mosque() {
  const guestRows = useMemo(() => {
    const rows: { x: number; z: number; men: boolean; seed: number }[] = [];
    let seed = 0;
    for (const z of [-7, -4.5, -2, 0.5, 3]) {
      for (const x of [-7.5, -6, -4.5, -3, -1.5, 1.5, 3, 4.5, 6, 7.5]) {
        rows.push({ x, z, men: x < 0, seed: seed++ });
      }
    }
    return rows;
  }, []);

  return (
    <group>
      {/* Plinth, steps and courtyard path */}
      <mesh geometry={box} material={materials.paving} position={[0, 0.5, -2]} scale={[50, 1, 44]} />
      <mesh geometry={box} material={materials.stoneTrim} position={[0, 0.25, 20.6]} scale={[14, 0.5, 1.4]} />
      <mesh geometry={box} material={materials.stoneTrim} position={[0, 0.06, 38]} scale={[8, 0.12, 34]} />
      <mesh geometry={box} material={materials.stoneTrim} position={[0, 1.03, 15]} scale={[8, 0.06, 10]} />

      {/* Fountain */}
      <group position={[0, FLOOR, 17]}>
        <mesh material={materials.stone} position={[0, 0.45, 0]}>
          <cylinderGeometry args={[3, 3.2, 0.9, 8]} />
        </mesh>
        <mesh material={water} position={[0, 0.82, 0]}>
          <cylinderGeometry args={[2.75, 2.75, 0.1, 8]} />
        </mesh>
        <mesh geometry={cylinder} material={materials.stoneTrim} position={[0, 1.1, 0]} scale={[0.4, 1.2, 0.4]} />
        <mesh material={materials.stone} position={[0, 1.75, 0]}>
          <cylinderGeometry args={[1.1, 0.8, 0.3, 12]} />
        </mesh>
        <mesh geometry={cylinder} material={water} position={[0, 2.3, 0]} scale={[0.09, 1, 0.09]} />
      </group>

      {/* Prayer hall walls */}
      <mesh geometry={box} material={materials.stone} position={[0, FLOOR + H / 2, -15.7]} scale={[W, H, 0.6]} />
      <mesh geometry={box} material={materials.stone} position={[-17.7, FLOOR + H / 2, -3]} scale={[0.6, H, D]} />
      <mesh geometry={box} material={materials.stone} position={[17.7, FLOOR + H / 2, -3]} scale={[0.6, H, D]} />
      <WallWithArch width={W} height={H} depth={0.6} arch={{ width: 8, height: 8.6 }} position={[0, FLOOR, 9.7]} />
      <mesh geometry={box} material={materials.stone} position={[0, FLOOR + H + 0.3, -3]} scale={[W, 0.6, D]} />

      {/* Iwan portal framing the entrance */}
      <WallWithArch
        width={13}
        height={13}
        depth={1.3}
        arch={{ width: 8.8, height: 9.6 }}
        material={materials.stoneTrim}
        position={[0, FLOOR, 10.5]}
      />
      <ArchFrame width={8.8} height={9.6} thickness={0.45} material={materials.tile} position={[0, FLOOR, 11.17]} />
      <Crenellation length={13} position={[0, FLOOR + 13, 10.5]} />

      {/* Facade niches and tile band */}
      {[-9.5, -13.5, 9.5, 13.5].map((x) => (
        <group key={x} position={[x, FLOOR + 1.6, 10.02]}>
          <ArchFrame width={2.6} height={6} thickness={0.3} />
          <ArchPanel width={2.6} height={6} position={[0, 0, 0.01]} />
        </group>
      ))}
      <mesh geometry={box} material={materials.tile} position={[0, FLOOR + H - 0.9, 10.02]} scale={[W, 0.7, 0.06]} />
      <Crenellation length={W} position={[0, FLOOR + H + 0.6, 9.7]} />
      <Crenellation length={W} position={[0, FLOOR + H + 0.6, -15.7]} />
      <Crenellation length={D} position={[-17.7, FLOOR + H + 0.6, -3]} rotation={[0, Math.PI / 2, 0]} />
      <Crenellation length={D} position={[17.7, FLOOR + H + 0.6, -3]} rotation={[0, Math.PI / 2, 0]} />

      {/* Domes */}
      <Dome radius={8} drumHeight={2} position={[0, FLOOR + H + 0.6, -4]} />
      <Dome radius={3.2} drumHeight={1.1} position={[-12.5, FLOOR + H + 0.6, -6]} />
      <Dome radius={3.2} drumHeight={1.1} position={[12.5, FLOOR + H + 0.6, -6]} />

      {/* Minarets */}
      <Minaret position={[-21.5, FLOOR, 8]} />
      <Minaret position={[21.5, FLOOR, 8]} />
      <Minaret position={[-21.5, FLOOR, -14]} height={24} />
      <Minaret position={[21.5, FLOOR, -14]} height={24} />

      {/* ---------- Interior ---------- */}
      <mesh geometry={box} material={carpet} position={[0, FLOOR + 0.02, -3]} scale={[33, 0.04, 24]} />
      {[-8, -5.5, -3, -0.5, 2].map((z) => (
        <mesh key={z} geometry={box} material={carpetStripe} position={[0, FLOOR + 0.05, z]} scale={[30, 0.02, 0.14]} />
      ))}
      <mesh geometry={box} material={carpetStripe} position={[0, FLOOR + 0.05, -3]} scale={[0.14, 0.02, 24]} />

      {[-9, 9].map((x) =>
        [-10, -3, 4].map((z) => (
          <group key={`${x}${z}`} position={[x, FLOOR, z]}>
            <mesh geometry={cylinder} material={materials.stone} position={[0, H / 2, 0]} scale={[0.55, H, 0.55]} />
            <mesh geometry={cylinder} material={materials.gold} position={[0, H - 0.3, 0]} scale={[0.75, 0.5, 0.75]} />
            <mesh geometry={cylinder} material={materials.gold} position={[0, 0.25, 0]} scale={[0.75, 0.5, 0.75]} />
          </group>
        ))
      )}

      {/* Mihrab and minbar */}
      <group position={[0, FLOOR, -15.35]}>
        <ArchFrame width={4.2} height={6.8} thickness={0.45} material={materials.gold} />
        <ArchPanel width={4.2} height={6.8} material={materials.mihrab} position={[0, 0, 0.01]} />
        <ArchFrame width={2.6} height={5} thickness={0.2} material={materials.gold} position={[0, 0.6, 0.02]} />
      </group>
      <group position={[4.5, FLOOR, -14.2]}>
        <mesh geometry={box} material={materials.wood} position={[0, 0.5, 0.6]} scale={[1.2, 1, 1.2]} />
        <mesh geometry={box} material={materials.wood} position={[0, 1, -0.3]} scale={[1.2, 2, 0.8]} />
        <mesh geometry={box} material={materials.wood} position={[0, 3.2, -0.3]} scale={[1.4, 0.15, 1.2]} />
        <Dome radius={0.55} drumHeight={0.1} position={[0, 3.25, -0.3]} />
      </group>

      {/* Garland of roses over the mihrab */}
      {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((x, i) => (
        <Flower
          key={i}
          position={[x, FLOOR + 7.15 - Math.abs(x) * 0.15, -15]}
          scale={0.4}
          color={i % 2 ? "#f6e7d8" : "#c8102e"}
        />
      ))}

      <Chandelier position={[0, FLOOR + H + 1.6, -4]} drop={4.2} radius={2.4} bulbs={12} light={{ intensity: 140, distance: 34 }} />

      {/* The Nikah: imam, groom and bride before the mihrab */}
      <mesh geometry={box} material={cushion} position={[-1.15, FLOOR + 0.07, -11]} scale={[1.2, 0.14, 1.1]} />
      <mesh geometry={box} material={cushion} position={[1.15, FLOOR + 0.07, -11]} scale={[1.2, 0.14, 1.1]} />
      <mesh geometry={box} material={materials.gold} position={[0, FLOOR + 0.05, -11]} scale={[4.6, 0.1, 2]} />
      <Person
        outfit="sherwani"
        primary="#f3e9d6"
        secondary="#f3e9d6"
        accent="#7a1f2b"
        headwear="safa"
        seated
        position={[-1.15, FLOOR + 0.14, -11]}
        rotation={[0, 0.12, 0]}
      />
      <Person
        outfit="lehenga"
        primary="#8a1226"
        headwear="dupatta"
        skin="#e0ac69"
        seated
        position={[1.15, FLOOR + 0.14, -11]}
        rotation={[0, -0.12, 0]}
      />
      <Person
        outfit="kurta"
        primary="#f7f3ea"
        secondary="#f7f3ea"
        headwear="cap"
        beard="#b8b2a8"
        skin="#c68642"
        seated
        book
        position={[0, FLOOR + 0.04, -12.6]}
      />

      {/* Congregation */}
      {guestRows.map((g) => (
        <Guest
          key={g.seed}
          seed={g.seed}
          style={g.men ? "mosque-men" : "mosque-women"}
          seated
          position={[g.x, FLOOR + 0.04, g.z]}
          rotation={[0, Math.PI, 0]}
        />
      ))}
      <Guest seed={201} style="mosque-men" seated={false} position={[-12, FLOOR, 6]} rotation={[0, 2.6, 0]} />
      <Guest seed={202} style="mosque-men" seated={false} position={[-13, FLOOR, 4.5]} rotation={[0, 3.4, 0]} />
      <Guest seed={203} style="mosque-women" seated={false} position={[12.5, FLOOR, 6]} rotation={[0, -2.8, 0]} />
    </group>
  );
}
