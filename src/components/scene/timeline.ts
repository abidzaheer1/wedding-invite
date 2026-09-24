import { Color } from "three";

/** Number of scroll pages; scene `i` is centred when `t === i`. */
export const PAGES = 6;

/** Hall is built far to the east so the camera can fly there at dusk. */
export const HALL_X = 140;

/**
 * Mutable per-frame timeline shared by every scene component. The camera rig
 * writes it once per frame; everything else reads it inside `useFrame`, so no
 * React re-renders are needed to animate the world.
 */
export const timeline = {
  /** Raw scroll in viewport-heights, written by the page scroller. */
  scroll: 0,
  /** Smoothed scroll position mapped onto 0..PAGES-1 */
  t: 0,
  /** 0 = golden afternoon, 1 = deep night */
  night: 0,
  /** Seconds since the experience mounted */
  elapsed: 0,
  pointerX: 0,
  pointerY: 0,
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const k = clamp((x - edge0) / (edge1 - edge0));
  return k * k * (3 - 2 * k);
}

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Deterministic pseudo-random in [0,1) — pure, so it is safe during render. */
export function rand(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export type Vec3 = [number, number, number];

/**
 * Three-stop colour ramp (afternoon → sunset → night) driven by `night`.
 * Writes into `out` to avoid per-frame allocations.
 */
export function rampColor(
  out: Color,
  day: Color,
  dusk: Color,
  night: Color,
  n: number
) {
  if (n < 0.5) out.copy(day).lerp(dusk, n * 2);
  else out.copy(dusk).lerp(night, (n - 0.5) * 2);
  return out;
}

type Ramp = [Color, Color, Color];
const ramp = (day: string, dusk: string, night: string): Ramp => [new Color(day), new Color(dusk), new Color(night)];

export const palette = {
  sky: {
    top: ramp("#5b9ee0", "#3f2f6e", "#03071a"),
    horizon: ramp("#ffe1b0", "#ff9a5c", "#141b33"),
    bottom: ramp("#c8b48e", "#5a4038", "#080a14"),
  },
  ground: ramp("#8fb66c", "#5f6a45", "#141a28"),
  sun: ramp("#fff1d6", "#ffb070", "#7f8fc4"),
};
