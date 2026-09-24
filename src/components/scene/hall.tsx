"use client";

import { useEffect, useRef } from "react";
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, type Object3D, type SpotLight } from "three";
import { ArchFrame, ArchPanel, WallWithArch, materials } from "./architecture";
import { BanquetTable, Chandelier, FairyString, FlowerWall, Lantern, bulbMaterial } from "./decor";
import { Guest, Person } from "./people";
import { HALL_X as X } from "./timeline";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 20);

const wall = new MeshStandardMaterial({ color: "#d9c4a0", roughness: 0.9, emissive: "#3a2412", emissiveIntensity: 0.12 });
const roof = new MeshStandardMaterial({ color: "#5a4a3c", roughness: 1 });
const floor = new MeshStandardMaterial({ color: "#3a2233", roughness: 0.35, metalness: 0.15 });
const stage = new MeshStandardMaterial({ color: "#6a1f2e", roughness: 0.9 });
const velvet = new MeshStandardMaterial({ color: "#efe2cc", roughness: 0.95 });
const drape = new MeshStandardMaterial({ color: "#f6efe4", roughness: 1 });
const carpetRed = new MeshStandardMaterial({ color: "#8b1c2b", roughness: 1 });
const windowGlow = new MeshStandardMaterial({ color: "#ffe1a8", emissive: "#ffb85c", emissiveIntensity: 1.7 });

/** Function hall footprint: x ∈ [X-18, X+18], z ∈ [-16, 10], walls y ∈ [1, 9]. */
const W = 36;
const D = 26;
const H = 8;
const FLOOR = 1;

function StageSpot() {
  const light = useRef<SpotLight>(null);
  const target = useRef<Object3D>(null);
  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current;
  }, []);
  return (
    <>
      <spotLight
        ref={light}
        position={[X, FLOOR + H - 0.4, -5]}
        angle={0.55}
        penumbra={0.7}
        intensity={260}
        distance={30}
        decay={1.5}
        color="#ffe2b8"
      />
      <object3D ref={target} position={[X, FLOOR + 1.5, -12.5]} />
    </>
  );
}

export function FunctionHall() {
  return (
    <group>
      {/* Plinth, driveway and red carpet */}
      <mesh geometry={box} material={materials.paving} position={[X, 0.5, -2]} scale={[50, 1, 40]} />
      <mesh geometry={box} material={materials.stoneTrim} position={[X, 0.25, 18.7]} scale={[14, 0.5, 1.4]} />
      <mesh geometry={box} material={carpetRed} position={[X, FLOOR + 0.03, 14]} scale={[4.2, 0.06, 8]} />
      <mesh geometry={box} material={carpetRed} position={[X, 0.04, 36]} scale={[4.2, 0.08, 34]} />
      {[24, 32, 40, 48].map((z) =>
        [-3.6, 3.6].map((dx) => <Lantern key={`${z}${dx}`} position={[X + dx, 0, z]} />)
      )}

      {/* Walls and roof */}
      <mesh geometry={box} material={wall} position={[X, FLOOR + H / 2, -15.7]} scale={[W, H, 0.6]} />
      <mesh geometry={box} material={wall} position={[X - 17.7, FLOOR + H / 2, -3]} scale={[0.6, H, D]} />
      <mesh geometry={box} material={wall} position={[X + 17.7, FLOOR + H / 2, -3]} scale={[0.6, H, D]} />
      <WallWithArch width={W} height={H} depth={0.6} arch={{ width: 8, height: 7 }} style="round" material={wall} position={[X, FLOOR, 9.7]} />
      <mesh geometry={box} material={roof} position={[X, FLOOR + H + 0.3, -3]} scale={[W + 0.8, 0.6, D + 0.8]} />
      <mesh geometry={box} material={materials.gold} position={[X, FLOOR + H + 0.2, 10.15]} scale={[W + 0.8, 0.25, 0.3]} />

      {/* Lit windows */}
      {[-13, -8.5, 8.5, 13].map((dx) => (
        <group key={dx} position={[X + dx, FLOOR + 2.2, 10.02]}>
          <ArchFrame width={2.4} height={4.6} thickness={0.25} style="round" material={materials.stoneTrim} />
          <ArchPanel width={2.4} height={4.6} style="round" material={windowGlow} position={[0, 0, 0.01]} />
        </group>
      ))}
      {[-10, -4, 2, 8].map((z) =>
        [-1, 1].map((side) => (
          <group
            key={`${z}${side}`}
            position={[X + side * 18.02, FLOOR + 2.4, -3 + z]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <ArchPanel width={2} height={4} style="round" material={windowGlow} />
          </group>
        ))
      )}

      {/* Entrance canopy */}
      <mesh geometry={box} material={roof} position={[X, FLOOR + 6.4, 14]} scale={[14, 0.45, 8.5]} />
      <mesh geometry={box} material={materials.gold} position={[X, FLOOR + 6.4, 18.3]} scale={[14, 0.5, 0.15]} />
      {[-6, 6].map((dx) =>
        [11, 17].map((z) => (
          <mesh key={`${dx}${z}`} geometry={cylinder} material={materials.stoneTrim} position={[X + dx, FLOOR + 3.1, z]} scale={[0.32, 6.2, 0.32]} />
        ))
      )}
      <pointLight position={[X, FLOOR + 5.6, 14]} intensity={70} distance={22} decay={1.6} color="#ffd39a" />
      <FairyString from={[X - 7, FLOOR + 6.15, 18.3]} to={[X + 7, FLOOR + 6.15, 18.3]} count={24} sag={0.35} />
      <FairyString from={[X - 7, FLOOR + 6.15, 9.9]} to={[X - 7, FLOOR + 6.15, 18.3]} count={16} sag={0.25} />
      <FairyString from={[X + 7, FLOOR + 6.15, 9.9]} to={[X + 7, FLOOR + 6.15, 18.3]} count={16} sag={0.25} />
      <FairyString from={[X - 7, FLOOR + 6.2, 18]} to={[X - 14, 9.6, 22]} count={22} sag={0.8} />
      <FairyString from={[X + 7, FLOOR + 6.2, 18]} to={[X + 14, 9.6, 22]} count={22} sag={0.8} />
      <FairyString from={[X - 18.4, FLOOR + H + 0.6, 10.2]} to={[X + 18.4, FLOOR + H + 0.6, 10.2]} count={60} sag={0.3} />
      <FairyString from={[X - 18.4, FLOOR + H + 0.6, 10.2]} to={[X - 18.4, FLOOR + H + 0.6, -16]} count={40} sag={0.3} />
      <FairyString from={[X + 18.4, FLOOR + H + 0.6, 10.2]} to={[X + 18.4, FLOOR + H + 0.6, -16]} count={40} sag={0.3} />

      {/* ---------- Interior ---------- */}
      <mesh geometry={box} material={floor} position={[X, FLOOR + 0.02, -3]} scale={[35, 0.04, 25]} />
      <mesh geometry={box} material={carpetRed} position={[X, FLOOR + 0.05, -1]} scale={[3.6, 0.03, 19]} />

      {/* Stage with floral backdrop, drapes and the couple's sofa */}
      <mesh geometry={box} material={stage} position={[X, FLOOR + 0.3, -12.8]} scale={[14, 0.6, 5]} />
      <mesh geometry={box} material={materials.gold} position={[X, FLOOR + 0.62, -12.8]} scale={[14.2, 0.06, 5.2]} />
      <mesh geometry={box} material={drape} position={[X, FLOOR + 3.4, -15.35]} scale={[13, 6.5, 0.3]} />
      <FlowerWall width={11} height={5.4} count={46} seed={7} scale={0.62} position={[X, FLOOR + 3.6, -15.12]} />
      {[-6.8, 6.8].map((dx) => (
        <mesh key={dx} geometry={box} material={drape} position={[X + dx, FLOOR + 4, -15]} rotation={[0, 0, dx > 0 ? -0.04 : 0.04]} scale={[1.5, 8, 0.6]} />
      ))}
      <group position={[X, FLOOR + 0.6, -13.7]}>
        <mesh geometry={box} material={velvet} position={[0, 0.55, 0]} scale={[3.6, 0.5, 1.1]} />
        <mesh geometry={box} material={velvet} position={[0, 1.25, -0.45]} scale={[3.6, 1.1, 0.25]} />
        <mesh geometry={box} material={velvet} position={[-1.8, 0.85, 0]} scale={[0.25, 0.9, 1.1]} />
        <mesh geometry={box} material={velvet} position={[1.8, 0.85, 0]} scale={[0.25, 0.9, 1.1]} />
        <mesh geometry={box} material={materials.gold} position={[0, 0.16, 0]} scale={[3.7, 0.12, 1.15]} />
      </group>

      {/* Groom in a dark brown suit, bride in red bridal lehenga */}
      <Person
        outfit="suit"
        primary="#3b2314"
        secondary="#f7f3ea"
        accent="#7a1f2b"
        skin="#c68642"
        position={[X - 0.75, FLOOR + 0.62, -12.2]}
        rotation={[0, 0.18, 0]}
      />
      <Person
        outfit="lehenga"
        primary="#c8102e"
        headwear="dupatta"
        skin="#e0ac69"
        position={[X + 0.75, FLOOR + 0.62, -12.2]}
        rotation={[0, -0.18, 0]}
      />

      {/* Lighting */}
      <Chandelier position={[X, FLOOR + H, -2]} drop={1.4} radius={2.4} bulbs={14} light={{ intensity: 150, distance: 36 }} />
      <Chandelier position={[X - 10, FLOOR + H, -6]} drop={1.2} radius={1.5} bulbs={10} light={{ intensity: 90, distance: 26 }} />
      <Chandelier position={[X + 10, FLOOR + H, -6]} drop={1.2} radius={1.5} bulbs={10} light={{ intensity: 90, distance: 26 }} />
      <Chandelier position={[X - 10, FLOOR + H, 4]} drop={1.2} radius={1.5} bulbs={10} />
      <Chandelier position={[X + 10, FLOOR + H, 4]} drop={1.2} radius={1.5} bulbs={10} />
      <StageSpot />
      {[-9, -3, 3, 8].map((z) => (
        <FairyString key={z} from={[X - 17.5, FLOOR + H - 0.2, z]} to={[X + 17.5, FLOOR + H - 0.2, z]} count={46} sag={0.9} />
      ))}
      {[-13, -6, 1, 8].map((z) => (
        <mesh key={z} material={bulbMaterial} position={[X - 17.6, FLOOR + 4.5, -3 + z]} scale={[0.1, 0.5, 0.1]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
        </mesh>
      ))}

      {/* Guests */}
      {[
        [-13, -6], [-7, -6], [7, -6], [13, -6],
        [-13, 0], [-7, 0], [7, 0], [13, 0],
        [-10, 6], [10, 6],
      ].map(([dx, z], i) => (
        <BanquetTable key={i} seed={i + 1} guests={3 + (i % 3)} position={[X + dx, FLOOR + 0.03, z]} />
      ))}
      <Guest seed={301} style="hall" seated={false} position={[X - 2.2, FLOOR, -8]} rotation={[0, -2.5, 0]} />
      <Guest seed={302} style="hall" seated={false} position={[X + 2.4, FLOOR, -7.4]} rotation={[0, 2.7, 0]} />
      <Guest seed={303} style="hall" seated={false} position={[X - 1.4, FLOOR, 7.5]} rotation={[0, 0.3, 0]} />
      <Guest seed={304} style="hall" seated={false} position={[X + 1.8, FLOOR, 8.2]} rotation={[0, -0.4, 0]} />
    </group>
  );
}
