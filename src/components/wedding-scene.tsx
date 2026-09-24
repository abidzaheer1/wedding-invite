"use client";

import {
  AdaptiveDpr,
  Environment,
  Float,
  Scroll,
  ScrollControls,
  Sparkles,
  useScroll,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { easing } from "maath";
import { useState } from "react";
import { useRef } from "react";
import type { Group } from "three";
import {
  Band,
  Bouquet,
  DiamondRing,
  Flower,
  PetalField,
} from "./objects-3d";

const SCENES = 5;
const SPACING = 9;

/** Local 0..1 progress of scene `i` as it passes through the viewport. */
function sceneProgress(offset: number, i: number) {
  const center = i / (SCENES - 1);
  const span = 1 / (SCENES - 1);
  return Math.max(0, Math.min(1, (offset - (center - span)) / (span * 2)));
}

function Choreography() {
  const scroll = useScroll();
  const rig = useRef<Group>(null);
  const heroRings = useRef<Group>(null);
  const bandA = useRef<Group>(null);
  const bandB = useRef<Group>(null);
  const bandPair = useRef<Group>(null);
  const [bloom1, setBloom1] = useState(0);
  const [bloom2, setBloom2] = useState(0);

  useFrame((state, dt) => {
    const o = scroll.offset;

    if (rig.current) {
      rig.current.position.y = o * (SCENES - 1) * SPACING;
      rig.current.rotation.y = Math.sin(o * Math.PI * 2) * 0.15;
    }

    if (heroRings.current) {
      heroRings.current.rotation.z = o * 1.2;
    }

    const garden = sceneProgress(o, 1);
    const details = sceneProgress(o, 2);
    setBloom1((b) => {
      const next = b + (garden - b) * Math.min(1, dt * 4);
      return Math.abs(next - b) < 0.001 ? b : next;
    });
    setBloom2((b) => {
      const next = b + (details - b) * Math.min(1, dt * 4);
      return Math.abs(next - b) < 0.001 ? b : next;
    });

    // Bring the two bands together so they overlap into a linked pair by the
    // time the section is centered. Keep them facing the camera (only gentle
    // tilt) so they never spin edge-on.
    const t = state.clock.elapsedTime;
    const link = Math.max(0, Math.min(1, (o - 0.5) / 0.25));
    if (bandA.current && bandB.current) {
      bandA.current.position.x = -2.5 + link * 1.95;
      bandB.current.position.x = 2.5 - link * 1.95;
      bandA.current.position.z = 0.35;
      bandB.current.position.z = -0.35;
      bandA.current.rotation.set(0.32 + Math.sin(t * 0.6) * 0.08, -0.38, Math.sin(t * 0.4) * 0.1);
      bandB.current.rotation.set(0.32 + Math.cos(t * 0.6) * 0.08, 0.38, -Math.sin(t * 0.4) * 0.1);
    }
    if (bandPair.current) {
      bandPair.current.rotation.y = Math.sin(t * 0.2) * 0.12;
    }

    const cam = state.camera;
    easing.damp3(
      cam.position,
      [state.pointer.x * 0.7, state.pointer.y * 0.5, 7],
      0.4,
      dt
    );
    cam.lookAt(0, rig.current ? rig.current.position.y * 0 : 0, 0);
  });

  return (
    <group ref={rig}>
      {/* Scene 0 — Hero: the solitaire */}
      <group position={[0, 0, 0]}>
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.9}>
          <group ref={heroRings} scale={1.15}>
            <DiamondRing position={[0, -0.7, 0]} spin={0.5} />
          </group>
        </Float>
        <Sparkles count={60} scale={7} size={3} speed={0.3} color="#f4d9ae" />
      </group>

      {/* Scene 1 — A garden in bloom */}
      <group position={[0, -SPACING, 0]}>
        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.6}>
          <Flower position={[-2.4, 0.6, 0]} scale={1.1} bloom={bloom1} color="#f0b8b0" seed={11} />
        </Float>
        <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.7}>
          <Flower position={[2.3, 0.9, -0.5]} scale={0.9} bloom={bloom1} color="#f6e7d8" coreColor="#e9c479" seed={23} />
        </Float>
        <Float speed={0.9} rotationIntensity={0.25} floatIntensity={0.6}>
          <Flower position={[0.2, -1, 0.4]} scale={1.25} bloom={bloom1} color="#d98a86" seed={37} />
        </Float>
        <Float speed={1.05} rotationIntensity={0.3} floatIntensity={0.7}>
          <Flower position={[-1.4, -1.4, -0.6]} scale={0.7} bloom={bloom1} color="#f6e7d8" seed={51} />
        </Float>
        <Sparkles count={40} scale={7} size={2} speed={0.25} color="#f0b8b0" />
      </group>

      {/* Scene 2 — The bouquet */}
      <group position={[0, -2 * SPACING, 0]}>
        <Float speed={0.8} rotationIntensity={0.4} floatIntensity={0.5}>
          <Bouquet position={[0, 0.4, 0]} scale={1.35} bloom={bloom2} />
        </Float>
        <Sparkles count={45} scale={8} size={2.5} speed={0.25} color="#f4d9ae" />
      </group>

      {/* Scene 3 — Two bands become one */}
      <group position={[0, -3 * SPACING, 0]}>
        <group ref={bandPair}>
          <group ref={bandA} scale={1.2}>
            <Band color="#e9c479" />
          </group>
          <group ref={bandB} scale={1.2}>
            <Band color="#f6e7d8" />
          </group>
        </group>
        <Sparkles count={50} scale={7} size={3} speed={0.3} color="#f4d9ae" />
      </group>

      {/* Scene 4 — Finale */}
      <group position={[0, -4 * SPACING, 0]}>
        <Float speed={1.3} rotationIntensity={0.5} floatIntensity={1}>
          <DiamondRing position={[0, -0.5, 0]} scale={1.05} spin={0.7} />
        </Float>
        <Sparkles count={70} scale={8} size={3.5} speed={0.35} color="#f4d9ae" />
      </group>
    </group>
  );
}

function ThreeWorld() {
  const { viewport } = useThree();
  return (
    <>
      <color attach="background" args={["#0c1620"]} />
      <fog attach="fog" args={["#0c1620", 9, 22]} />
      <ambientLight intensity={0.9} />
      <spotLight position={[6, 8, 6]} angle={0.5} penumbra={1} intensity={90} color="#f0d3a0" />
      <pointLight position={[-6, -2, 4]} intensity={30} color="#6f8b9a" distance={20} />
      <pointLight position={[0, 0, 6]} intensity={18} color="#ffe9c7" distance={14} />

      <Choreography />

      {/* Ambient petals that drift over the whole journey */}
      <group position={[0, 0, 2]} scale={Math.max(1, viewport.width / 8)}>
        <PetalField count={120} area={16} height={20} />
      </group>

      <Environment preset="sunset" environmentIntensity={0.55} />
      <EffectComposer>
        <Bloom luminanceThreshold={1.05} intensity={0.55} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </>
  );
}

function Overlay() {
  const [attending, setAttending] = useState(false);

  return (
    <Scroll html>
      <div className="story">
        <section className="panel panel--hero">
          <span className="kicker">Together with their families</span>
          <p className="script">Julia</p>
          <p className="amp">&amp;</p>
          <p className="script">Luca</p>
          <p className="hero-sub">are getting married in Rome</p>
          <div className="hero-meta">
            <span>Saturday</span>
            <em>July 6, 2026</em>
            <span>Villa Aurelia</span>
          </div>
          <span className="scroll-hint">scroll to begin ↓</span>
        </section>

        <section className="panel panel--right">
          <div className="card">
            <span className="kicker">Our story</span>
            <h2>Two cities, one spring, a garden in Trastevere.</h2>
            <p>
              We met beneath the orange trees of a Roman courtyard, shared a
              clumsy espresso, and never quite said goodbye. Six years later, we
              are planting roots — and we would love for you to be there when we
              do.
            </p>
          </div>
        </section>

        <section className="panel panel--left">
          <div className="card">
            <span className="kicker">The celebration</span>
            <h2>A bouquet of an evening, gathered just for you.</h2>
            <ul className="details">
              <li>
                <em>Ceremony</em>
                <span>4:00 PM · Villa Aurelia gardens</span>
              </li>
              <li>
                <em>Reception</em>
                <span>6:30 PM · The Orangery, dinner &amp; dancing</span>
              </li>
              <li>
                <em>Dress code</em>
                <span>Garden formal · warm tones welcome</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="panel panel--center">
          <div className="card card--center">
            <span className="kicker">Two become one</span>
            <h2>Rings exchanged as the sun sets over the Janiculum.</h2>
            <p>
              A short ceremony, a long celebration, and a lifetime after. Golden
              hour begins at 7:14 PM — you will not want to miss it.
            </p>
          </div>
        </section>

        <section className="panel panel--hero panel--rsvp">
          <span className="kicker">With love</span>
          <p className="script script--sm">Join us</p>
          <p className="hero-sub">Kindly reply by May 1, 2026</p>
          <button
            className={`rsvp ${attending ? "rsvp--on" : ""}`}
            onClick={() => setAttending((v) => !v)}
          >
            {attending ? "You're on the list" : "Accept with joy"}
            <span aria-hidden="true">{attending ? "✓" : "↗"}</span>
          </button>
          <div className="hero-meta hero-meta--footer">
            <span>Julia &amp; Luca</span>
            <em>07 · 06 · 26</em>
            <span>Roma</span>
          </div>
        </section>
      </div>
    </Scroll>
  );
}

export function WeddingScene() {
  return (
    <div className="experience">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <ScrollControls pages={SCENES} damping={0.28}>
          <ThreeWorld />
          <Overlay />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
