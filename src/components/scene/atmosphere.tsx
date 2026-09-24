"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  type DirectionalLight,
  type Fog,
  type HemisphereLight,
  type Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  type Points,
  type PointsMaterial,
  Vector3,
} from "three";
import { HALL_X, palette, rampColor, rand, timeline } from "./timeline";

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 c = h >= 0.0
      ? mix(horizonColor, topColor, pow(h, 0.55))
      : mix(horizonColor, bottomColor, pow(-h, 0.5));
    gl_FragColor = vec4(c, 1.0);
  }
`;

/** Huge inverted sphere with a vertical gradient that follows the time of day. */
export function GradientSky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color() },
      horizonColor: { value: new Color() },
      bottomColor: { value: new Color() },
    }),
    []
  );

  useFrame(() => {
    const n = timeline.night;
    rampColor(uniforms.topColor.value, ...palette.sky.top, n);
    rampColor(uniforms.horizonColor.value, ...palette.sky.horizon, n);
    rampColor(uniforms.bottomColor.value, ...palette.sky.bottom, n);
  });

  return (
    <mesh position={[HALL_X / 2, 0, 0]} frustumCulled={false}>
      <sphereGeometry args={[900, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/** Field of stars that fades in as the reception approaches. */
export function Stars({ count = 1800 }: { count?: number }) {
  const points = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rand(i * 3 + 1);
      const v = rand(i * 3 + 2);
      const theta = u * Math.PI * 2;
      const phi = Math.acos(1 - v); // upper hemisphere
      const r = 760;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta) + HALL_X / 2;
      arr[i * 3 + 1] = Math.max(15, r * Math.cos(phi));
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const m = points.current?.material as PointsMaterial | undefined;
    if (!m) return;
    const twinkle = 0.85 + Math.sin(state.clock.elapsedTime * 2.1) * 0.15;
    m.opacity = timeline.night * twinkle;
    if (points.current) points.current.visible = timeline.night > 0.02;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e6ecff"
        size={2.2}
        sizeAttenuation={false}
        transparent
        depthWrite={false}
        fog={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/** Sun that sets behind the mosque and a moon that rises over the hall. */
export function SunAndMoon() {
  const sun = useRef<Mesh>(null);
  const moon = useRef<Mesh>(null);
  const dir = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const n = timeline.night;
    sunDirection(dir, n);
    if (sun.current) {
      sun.current.position.copy(dir).multiplyScalar(720);
      sun.current.position.x += HALL_X / 2;
      const m = sun.current.material as MeshBasicMaterial;
      rampColor(m.color, ...palette.sun, n);
      m.opacity = 1 - Math.max(0, (n - 0.7) / 0.3);
      sun.current.visible = n < 0.98;
    }
    if (moon.current) {
      const m = moon.current.material as MeshBasicMaterial;
      m.opacity = Math.max(0, (n - 0.5) / 0.5);
      moon.current.visible = n > 0.5;
      moon.current.position.y = 120 + n * 90;
    }
  });

  return (
    <>
      <mesh ref={sun}>
        <sphereGeometry args={[26, 24, 16]} />
        <meshBasicMaterial color="#fff1d6" transparent fog={false} />
      </mesh>
      <mesh ref={moon} position={[HALL_X + 260, 200, -560]}>
        <sphereGeometry args={[16, 24, 16]} />
        <meshBasicMaterial color="#eef1ff" transparent fog={false} />
      </mesh>
    </>
  );
}

/** Sun elevation goes from a warm afternoon down below the horizon. */
export function sunDirection(out: Vector3, night: number) {
  const elevation = (32 - night * 44) * (Math.PI / 180);
  const azimuth = -0.75;
  out.set(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    -Math.cos(elevation) * Math.cos(azimuth)
  );
  return out;
}

const scratchDir = new Vector3();
const scratchColor = new Color();
const hemiSky = { day: new Color("#cfe7ff"), night: new Color("#1a2444") };
const hemiGround = { day: new Color("#a08a5a"), night: new Color("#0a0c16") };

/** Key/fill lights and fog that follow the day → night ramp. */
export function Lighting() {
  const sunLight = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const fog = useRef<Fog>(null);

  useFrame(() => {
    const n = timeline.night;
    if (sunLight.current) {
      sunDirection(scratchDir, Math.min(n, 0.75));
      sunLight.current.position.copy(scratchDir).multiplyScalar(200);
      sunLight.current.intensity = 3.2 * (1 - n) + 0.35 * n;
      rampColor(sunLight.current.color, ...palette.sun, n);
    }
    if (hemi.current) {
      hemi.current.color.copy(hemiSky.day).lerp(hemiSky.night, n);
      hemi.current.groundColor.copy(hemiGround.day).lerp(hemiGround.night, n);
      hemi.current.intensity = 1.1 - n * 0.6;
    }
    if (fog.current) {
      rampColor(scratchColor, ...palette.sky.horizon, n);
      fog.current.color.copy(scratchColor);
      fog.current.near = 70 - n * 20;
      fog.current.far = 520 - n * 200;
    }
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#ffe1b0", 70, 520]} />
      <hemisphereLight ref={hemi} args={["#cfe7ff", "#a08a5a", 1.1]} />
      <directionalLight ref={sunLight} position={[60, 120, 80]} intensity={3.2} color="#fff1d6" />
    </>
  );
}

/** Endless grass with rolling hills on the horizon. */
export function Ground() {
  const grass = useRef<MeshStandardMaterial>(null);
  const hillMat = useMemo(
    () => new MeshStandardMaterial({ color: "#6f9a58", roughness: 1 }),
    []
  );
  const hillDay = useMemo(() => new Color("#6f9a58"), []);
  const hillNight = useMemo(() => new Color("#0f1524"), []);

  useFrame(() => {
    const n = timeline.night;
    if (grass.current) rampColor(grass.current.color, ...palette.ground, n);
    hillMat.color.copy(hillDay).lerp(hillNight, n);
  });

  const hills = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const a = (i / 22) * Math.PI * 2 + rand(i) * 0.2;
        const r = 330 + rand(i + 50) * 160;
        return {
          pos: [HALL_X / 2 + Math.cos(a) * r, -6, Math.sin(a) * r] as const,
          scale: [70 + rand(i + 90) * 80, 18 + rand(i + 130) * 22, 60 + rand(i + 170) * 60] as const,
        };
      }),
    []
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[HALL_X / 2, 0, 0]}>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial ref={grass} color="#8fb66c" roughness={1} />
      </mesh>
      <group>
        {hills.map((h, i) => (
          <mesh key={i} position={h.pos} scale={h.scale} material={hillMat}>
            <sphereGeometry args={[1, 18, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
