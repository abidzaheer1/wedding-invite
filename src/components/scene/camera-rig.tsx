"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import { HALL_X as X, clamp, smoothstep, timeline, type Vec3 } from "./timeline";

type Key = {
  pos: Vec3;
  look: Vec3;
  /** Optional quadratic-bezier control points for the segment arriving at this key. */
  viaPos?: Vec3;
  viaLook?: Vec3;
};

/**
 * One key per scroll page. The camera eases between consecutive keys, coming
 * to rest exactly when a page (and its overlay text) is centred.
 */
const KEYS: Key[] = [
  // 0 · In the clouds, names appearing
  { pos: [0, 58, 40], look: [0, 61, -60] },
  // 1 · Descend to reveal the mosque in the afternoon light
  { pos: [0, 9, 62], look: [0, 9, 0], viaPos: [0, 46, 92], viaLook: [0, 30, -20] },
  // 2 · Glide through the iwan to the nikah before the mihrab
  { pos: [0, 2.7, -6.2], look: [0, 1.9, -11.4] },
  // 3 · Back out of the mosque and fly east as the sun sets on the hall
  { pos: [X, 6.5, 54], look: [X, 7, 0], viaPos: [0, 20, 110], viaLook: [40, 12, 10] },
  // 4 · Under the canopy and into the reception
  { pos: [X, 3.0, -4], look: [X, 2.1, -12.3] },
  // 5 · Close on the couple for the invitation
  { pos: [X - 1.2, 2.7, -7.6], look: [X - 0.3, 2.2, -12.3] },
];

function bezier(out: Vector3, a: Vec3, b: Vec3, via: Vec3 | undefined, s: number) {
  if (!via) {
    out.set(a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s);
    return out;
  }
  const u = 1 - s;
  const w0 = u * u;
  const w1 = 2 * u * s;
  const w2 = s * s;
  out.set(
    w0 * a[0] + w1 * via[0] + w2 * b[0],
    w0 * a[1] + w1 * via[1] + w2 * b[1],
    w0 * a[2] + w1 * via[2] + w2 * b[2]
  );
  return out;
}

export function CameraRig() {
  const pos = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);

  useFrame((state, dt) => {
    // The RSVP page can run past the last scene; the camera parks on it.
    const goal = clamp(timeline.scroll, 0, KEYS.length - 1);
    const t = (timeline.t += (goal - timeline.t) * (1 - Math.exp(-dt * 4)));
    timeline.night = smoothstep(2.25, 2.9, t);
    timeline.elapsed += dt;

    const i = Math.min(Math.floor(t), KEYS.length - 2);
    const local = clamp(t - i, 0, 1);
    const s = local * local * (3 - 2 * local);
    const a = KEYS[i];
    const b = KEYS[i + 1];
    bezier(pos, a.pos, b.pos, b.viaPos, s);
    bezier(look, a.look, b.look, b.viaLook, s);

    // Gentle parallax from the pointer plus a barely-there breathing motion.
    const px = timeline.pointerX * 0.6;
    const py = timeline.pointerY * 0.35;
    const breathe = Math.sin(timeline.elapsed * 0.7) * 0.05;
    target.set(pos.x + px, pos.y + py + breathe, pos.z);

    state.camera.position.lerp(target, 1 - Math.exp(-dt * 6));
    state.camera.lookAt(look);
  });

  return null;
}
