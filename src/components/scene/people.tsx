"use client";

import { useMemo } from "react";
import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { rand } from "./timeline";

export const SKIN = ["#c68642", "#e0ac69", "#8d5524", "#f1c27d", "#a9704a"];
const GOLD = "#d4a94a";

const sphere = new SphereGeometry(1, 20, 14);
const cylinder = new CylinderGeometry(1, 1, 1, 12);
const box = new BoxGeometry(1, 1, 1);
const torso = new CapsuleGeometry(1, 1, 4, 12);
const cone = new ConeGeometry(1, 1, 24);
const torus = new TorusGeometry(1, 0.12, 8, 24);
const goldMaterial = new MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.3 });

const materialCache = new Map<string, MeshStandardMaterial>();
function mat(color: string, extra?: Partial<{ roughness: number; metalness: number; opacity: number }>) {
  const key = `${color}|${extra?.roughness ?? ""}|${extra?.metalness ?? ""}|${extra?.opacity ?? ""}`;
  let m = materialCache.get(key);
  if (!m) {
    m = new MeshStandardMaterial({
      color,
      roughness: extra?.roughness ?? 0.7,
      metalness: extra?.metalness ?? 0,
      transparent: extra?.opacity !== undefined,
      opacity: extra?.opacity ?? 1,
      side: extra?.opacity !== undefined ? DoubleSide : undefined,
    });
    materialCache.set(key, m);
  }
  return m;
}

export type Outfit = "suit" | "sherwani" | "lehenga" | "kurta";
export type Headwear = "none" | "cap" | "safa" | "dupatta";

export type PersonProps = {
  outfit: Outfit;
  /** Main garment colour */
  primary: string;
  /** Shirt / trim colour */
  secondary?: string;
  /** Tie, safa, jewellery accents */
  accent?: string;
  skin?: string;
  hair?: string;
  beard?: string;
  headwear?: Headwear;
  seated?: boolean;
  /** Small prop held in front (imam's book) */
  book?: boolean;
} & React.ComponentProps<"group">;

/**
 * Stylised low-poly person assembled from shared primitives. Origin is at the
 * feet (or at the floor when seated) and the figure faces +Z.
 */
export function Person({
  outfit,
  primary,
  secondary = "#f7f3ea",
  accent = GOLD,
  skin = SKIN[0],
  hair = "#1a1210",
  beard,
  headwear = "none",
  seated = false,
  book = false,
  ...props
}: PersonProps) {
  const skinMat = mat(skin);
  const primaryMat = mat(primary);
  const secondaryMat = mat(secondary);
  const accentMat = mat(accent);
  const hairMat = mat(hair, { roughness: 0.9 });

  const headY = seated ? 1.16 : 1.62;
  const torsoY = seated ? 0.72 : 1.2;
  const isLehenga = outfit === "lehenga";
  const longCoat = outfit === "sherwani" || outfit === "kurta";

  return (
    <group {...props}>
      {/* Legs / seat */}
      {seated ? (
        isLehenga ? (
          <mesh geometry={cone} material={primaryMat} position={[0, 0.26, 0.05]} scale={[0.82, 0.52, 0.72]} />
        ) : (
          <mesh geometry={box} material={primaryMat} position={[0, 0.15, 0.08]} scale={[0.74, 0.3, 0.66]} />
        )
      ) : isLehenga ? (
        <>
          <mesh geometry={cone} material={primaryMat} position={[0, 0.55, 0]} scale={[0.58, 1.1, 0.58]} />
          <mesh geometry={torus} material={goldMaterial} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.55, 0.55, 0.3]} />
        </>
      ) : (
        <>
          <mesh geometry={cylinder} material={longCoat ? secondaryMat : primaryMat} position={[-0.12, 0.42, 0]} scale={[0.1, 0.84, 0.1]} />
          <mesh geometry={cylinder} material={longCoat ? secondaryMat : primaryMat} position={[0.12, 0.42, 0]} scale={[0.1, 0.84, 0.1]} />
          <mesh geometry={box} material={mat("#2a1a12")} position={[-0.12, 0.05, 0.05]} scale={[0.14, 0.1, 0.3]} />
          <mesh geometry={box} material={mat("#2a1a12")} position={[0.12, 0.05, 0.05]} scale={[0.14, 0.1, 0.3]} />
        </>
      )}

      {/* Torso */}
      <mesh
        geometry={torso}
        material={primaryMat}
        position={[0, longCoat && !seated ? torsoY - 0.18 : torsoY, 0]}
        scale={longCoat && !seated ? [0.26, 0.42, 0.22] : [0.25, 0.26, 0.2]}
      />

      {/* Suit shirt + tie / sherwani buttons / bridal necklace */}
      {outfit === "suit" && (
        <>
          <mesh geometry={box} material={secondaryMat} position={[0, torsoY + 0.1, 0.19]} scale={[0.16, 0.34, 0.06]} />
          <mesh geometry={box} material={accentMat} position={[0, torsoY + 0.06, 0.225]} scale={[0.06, 0.3, 0.02]} />
          <mesh geometry={box} material={accentMat} position={[-0.15, torsoY + 0.18, 0.2]} scale={[0.08, 0.03, 0.02]} />
        </>
      )}
      {outfit === "sherwani" &&
        [0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            geometry={sphere}
            material={goldMaterial}
            position={[0, torsoY + 0.22 - i * 0.13, 0.24]}
            scale={0.025}
          />
        ))}
      {isLehenga && (
        <>
          <mesh geometry={torus} material={goldMaterial} position={[0, torsoY + 0.24, 0.12]} rotation={[0.5, 0, 0]} scale={[0.17, 0.17, 0.5]} />
          <mesh geometry={box} material={goldMaterial} position={[0, torsoY, 0.2]} scale={[0.34, 0.06, 0.03]} />
        </>
      )}

      {/* Arms */}
      {seated ? (
        <>
          <mesh geometry={cylinder} material={primaryMat} position={[-0.3, 0.6, 0.18]} rotation={[0.9, 0, 0.25]} scale={[0.075, 0.5, 0.075]} />
          <mesh geometry={cylinder} material={primaryMat} position={[0.3, 0.6, 0.18]} rotation={[0.9, 0, -0.25]} scale={[0.075, 0.5, 0.075]} />
          <mesh geometry={sphere} material={skinMat} position={[-0.26, 0.4, 0.38]} scale={0.075} />
          <mesh geometry={sphere} material={skinMat} position={[0.26, 0.4, 0.38]} scale={0.075} />
        </>
      ) : (
        <>
          <mesh geometry={cylinder} material={primaryMat} position={[-0.33, torsoY - 0.08, 0]} rotation={[0, 0, 0.14]} scale={[0.075, 0.62, 0.075]} />
          <mesh geometry={cylinder} material={primaryMat} position={[0.33, torsoY - 0.08, 0]} rotation={[0, 0, -0.14]} scale={[0.075, 0.62, 0.075]} />
          <mesh geometry={sphere} material={skinMat} position={[-0.37, torsoY - 0.42, 0]} scale={0.075} />
          <mesh geometry={sphere} material={skinMat} position={[0.37, torsoY - 0.42, 0]} scale={0.075} />
          {isLehenga && (
            <>
              <mesh geometry={torus} material={goldMaterial} position={[-0.37, torsoY - 0.34, 0]} scale={[0.09, 0.09, 0.4]} />
              <mesh geometry={torus} material={goldMaterial} position={[0.37, torsoY - 0.34, 0]} scale={[0.09, 0.09, 0.4]} />
            </>
          )}
        </>
      )}

      {book && (
        <mesh geometry={box} material={mat("#2f6b4f")} position={[0, 0.46, 0.36]} rotation={[-0.5, 0, 0]} scale={[0.3, 0.04, 0.22]} />
      )}

      {/* Neck + head */}
      <mesh geometry={cylinder} material={skinMat} position={[0, headY - 0.22, 0]} scale={[0.07, 0.12, 0.07]} />
      <mesh geometry={sphere} material={skinMat} position={[0, headY, 0]} scale={0.19} />

      {/* Hair (left open at the front for the face) */}
      {headwear !== "dupatta" && (
        <mesh position={[0, headY + 0.02, -0.02]} rotation={[0, Math.PI / 2, 0]} scale={0.205} material={hairMat}>
          <sphereGeometry args={[1, 20, 14, 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.62]} />
        </mesh>
      )}
      {beard && (
        <mesh geometry={sphere} material={mat(beard, { roughness: 0.95 })} position={[0, headY - 0.13, 0.08]} scale={[0.14, 0.11, 0.12]} />
      )}

      {/* Headwear */}
      {headwear === "cap" && (
        <>
          <mesh geometry={cylinder} material={secondaryMat} position={[0, headY + 0.16, 0]} scale={[0.185, 0.11, 0.185]} />
          <mesh geometry={torus} material={goldMaterial} position={[0, headY + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.185, 0.185, 0.12]} />
        </>
      )}
      {headwear === "safa" && (
        <>
          <mesh geometry={sphere} material={accentMat} position={[0, headY + 0.13, -0.01]} scale={[0.25, 0.17, 0.25]} />
          <mesh geometry={torus} material={goldMaterial} position={[0, headY + 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.22, 0.22, 0.25]} />
          <mesh geometry={sphere} material={goldMaterial} position={[0.06, headY + 0.24, 0.16]} scale={[0.035, 0.09, 0.03]} />
          <mesh geometry={box} material={accentMat} position={[0.2, headY - 0.3, -0.16]} rotation={[0.1, 0, -0.15]} scale={[0.12, 0.7, 0.04]} />
        </>
      )}
      {headwear === "dupatta" && (
        <>
          <mesh position={[0, headY + 0.03, -0.02]} rotation={[0, Math.PI / 2, 0]} scale={[0.255, 0.27, 0.255]} material={primaryMat}>
            <sphereGeometry args={[1, 24, 16, 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.72]} />
          </mesh>
          <mesh geometry={torus} material={goldMaterial} position={[0, headY + 0.12, 0.17]} rotation={[1.2, 0, 0]} scale={[0.2, 0.2, 0.25]} />
          <mesh geometry={box} material={primaryMat} position={[0, headY - 0.45, -0.23]} rotation={[0.12, 0, 0]} scale={[0.62, seated ? 0.7 : 0.95, 0.05]} />
          <mesh geometry={sphere} material={goldMaterial} position={[0, headY + 0.05, 0.19]} scale={0.03} />
        </>
      )}
    </group>
  );
}

export type GuestStyle = "mosque-men" | "mosque-women" | "hall";

const MOSQUE_MEN = ["#f4efe4", "#e8e2d3", "#d8dde6", "#cfd8e8", "#efe6d0"];
const MOSQUE_WOMEN = ["#2e7d7a", "#c48a1d", "#7a8a3a", "#8b4a6b", "#2f4a7a", "#a63d3d", "#5f8a6a"];
const HALL_GUESTS = ["#1f2a44", "#3b3b3b", "#4a2a20", "#0f6b5c", "#7a1f4d", "#b8860b", "#1d4e89", "#8a1c2b", "#5b3a7a"];

/**
 * Cheap three-mesh figure for crowds. Origin at the floor (or seat) and faces
 * +Z. Deterministic per `seed` so the crowd is stable between renders.
 */
export function Guest({
  seed,
  style,
  seated = true,
  ...props
}: { seed: number; style: GuestStyle; seated?: boolean } & React.ComponentProps<"group">) {
  const look = useMemo(() => {
    const skin = SKIN[Math.floor(rand(seed * 3 + 1) * SKIN.length)];
    const pool = style === "mosque-men" ? MOSQUE_MEN : style === "mosque-women" ? MOSQUE_WOMEN : HALL_GUESTS;
    const color = pool[Math.floor(rand(seed * 5 + 2) * pool.length)];
    const woman = style === "mosque-women" || (style === "hall" && rand(seed * 7 + 3) > 0.5);
    return { skin, color, woman, lean: (rand(seed * 11 + 4) - 0.5) * 0.14 };
  }, [seed, style]);

  const bodyMat = mat(look.color);
  const headY = seated ? 0.86 : 1.55;

  return (
    <group {...props} rotation={[0, look.lean, 0]}>
      {seated ? (
        <mesh geometry={torso} material={bodyMat} position={[0, 0.42, 0]} scale={[0.27, 0.32, 0.24]} />
      ) : (
        <mesh geometry={torso} material={bodyMat} position={[0, 0.85, 0]} scale={[0.25, 0.55, 0.22]} />
      )}
      <mesh geometry={sphere} material={mat(look.skin)} position={[0, headY, 0]} scale={0.175} />
      {look.woman ? (
        <mesh position={[0, headY + 0.03, -0.02]} rotation={[0, Math.PI / 2, 0]} scale={[0.225, 0.24, 0.225]} material={bodyMat}>
          <sphereGeometry args={[1, 14, 10, 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.72]} />
        </mesh>
      ) : style === "hall" ? (
        <mesh position={[0, headY + 0.02, -0.02]} rotation={[0, Math.PI / 2, 0]} scale={0.19} material={mat("#1a1210", { roughness: 0.9 })}>
          <sphereGeometry args={[1, 14, 10, 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.6]} />
        </mesh>
      ) : (
        <mesh geometry={cylinder} material={mat("#f7f3ea")} position={[0, headY + 0.15, 0]} scale={[0.17, 0.1, 0.17]} />
      )}
    </group>
  );
}
