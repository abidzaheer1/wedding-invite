"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef } from "react";
import { wedding } from "@/data/wedding";
import { RsvpForm } from "./rsvp-form";
import { GradientSky, Ground, Lighting, Stars, SunAndMoon } from "./scene/atmosphere";
import { CameraRig } from "./scene/camera-rig";
import { FunctionHall } from "./scene/hall";
import { Mosque } from "./scene/mosque";
import { Clouds, Greenery } from "./scene/nature";
import { clamp, timeline } from "./scene/timeline";

function World() {
  return (
    <>
      <GradientSky />
      <Stars />
      <SunAndMoon />
      <Lighting />
      <Ground />
      <Clouds />
      <Greenery />
      <Mosque />
      <FunctionHall />
      <CameraRig />
      <EffectComposer>
        <Bloom luminanceThreshold={1.0} intensity={0.75} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.18} darkness={0.75} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </>
  );
}

function EventCard({
  event,
  align,
  chapter,
}: {
  event: typeof wedding.nikah | typeof wedding.valima;
  align: "left" | "right";
  chapter: string;
}) {
  return (
    <div className={`card card--${align}`}>
      <span className="kicker">{chapter}</span>
      <h2>{event.title}</h2>
      <ul className="details">
        <li>
          <em>When</em>
          <span>{event.date}</span>
          <span className="details-sub">{event.time}</span>
        </li>
        <li>
          <em>Where</em>
          <span>{event.venue}</span>
          <span className="details-sub">{event.address}</span>
        </li>
        <li>
          <em>Note</em>
          <span className="details-sub">{event.note}</span>
        </li>
      </ul>
      <a className="map-link" href={event.mapUrl} target="_blank" rel="noreferrer">
        Open in Maps <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/** Fades each chapter in as the native scroller reaches it. */
function Story() {
  const story = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const sections = story.current?.children;
      if (sections) {
        const t = timeline.scroll;
        const last = sections.length - 1;
        for (let i = 0; i < sections.length; i++) {
          const v = i === last ? clamp((t - (i - 0.85)) / 0.85) : clamp(1 - Math.abs(t - i) / 0.6);
          const el = sections[i] as HTMLElement;
          el.style.opacity = v.toFixed(3);
          el.style.setProperty("--reveal", v.toFixed(3));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={story} className="story">
        <section className="panel panel--hero">
          <p className="bismillah emerge" style={{ animationDelay: "0.4s" }}>
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <span className="kicker emerge" style={{ animationDelay: "2.4s" }}>
            With the grace of Allah and the blessings of our families
          </span>
          <p className="script emerge emerge--cloud" style={{ animationDelay: "1s" }}>
            {wedding.groom.name}
          </p>
          <p className="amp emerge" style={{ animationDelay: "1.9s" }}>
            &amp;
          </p>
          <p className="script emerge emerge--cloud" style={{ animationDelay: "1.45s" }}>
            {wedding.bride.name}
          </p>
          <p className="hero-sub emerge" style={{ animationDelay: "2.8s" }}>
            invite you to celebrate their Nikah &amp; Valima
          </p>
          <div className="hero-meta emerge" style={{ animationDelay: "3.2s" }}>
            <span>{wedding.nikah.date.split(",")[1]?.trim()}</span>
            <em>&amp;</em>
            <span>{wedding.valima.date.split(",")[1]?.trim()}</span>
            <i>{wedding.city}</i>
          </div>
          <span className="scroll-hint emerge" style={{ animationDelay: "3.8s" }}>
            scroll to begin ↓
          </span>
        </section>

        <section className="panel panel--caption">
          <div className="caption">
            <span className="kicker">Chapter one</span>
            <h2>{wedding.nikah.title}</h2>
            <p>Two hearts joined in the sight of Allah, beneath the dome of {wedding.nikah.venue}.</p>
          </div>
        </section>

        <section className="panel panel--right">
          <EventCard event={wedding.nikah} align="right" chapter="The Nikah ceremony" />
        </section>

        <section className="panel panel--caption">
          <div className="caption">
            <span className="kicker">Chapter two</span>
            <h2>{wedding.valima.title}</h2>
            <p>As the stars come out, the celebration begins at {wedding.valima.venue}.</p>
          </div>
        </section>

        <section className="panel panel--left">
          <EventCard event={wedding.valima} align="left" chapter="The Valima reception" />
        </section>

        <section className="panel panel--rsvp">
          <div className="rsvp-intro">
            <span className="kicker">With love, from both our families</span>
            <h2 className="rsvp-title">
              You are <span>heartily</span> invited
            </h2>
            <p className="rsvp-lead">
              {wedding.groom.fullName}, {wedding.groom.parents}, and {wedding.bride.fullName}, {wedding.bride.parents},
              would be honoured by your presence. Kindly let us know which celebrations you will join.
            </p>
          </div>
          <RsvpForm />
          <div className="hero-meta hero-meta--footer">
            <span>
              {wedding.groom.name} &amp; {wedding.bride.name}
            </span>
            <em>{wedding.hashtag}</em>
            <span>{wedding.city}</span>
          </div>
        </section>
    </div>
  );
}

export function WeddingScene() {
  return (
    <div className="experience">
      <Canvas
        camera={{ position: [0, 58, 40], fov: 42, near: 0.5, far: 2200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <World />
      </Canvas>
      <div
        className="scroller"
        onScroll={(e) => {
          const el = e.currentTarget;
          timeline.scroll = el.clientHeight ? el.scrollTop / el.clientHeight : 0;
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          timeline.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
          timeline.pointerY = -((e.clientY - r.top) / r.height) * 2 + 1;
        }}
      >
        <Story />
      </div>
    </div>
  );
}
