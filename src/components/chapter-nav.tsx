"use client";

import { useEffect, useRef } from "react";
import { PAGES, timeline } from "./scene/timeline";

const CHAPTERS = ["Bismillah", "The Nikah", "Inside the Masjid", "The Valima", "The Reception", "RSVP"];

/** Fixed chapter indicator that mirrors the scroll position of the 3D story. */
export function ChapterNav() {
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastActive = -1;
    const tick = () => {
      const active = Math.round(timeline.t);
      if (active !== lastActive) {
        lastActive = active;
        dots.current.forEach((d, i) => d?.classList.toggle("chapter-dot--on", i === active));
        if (label.current) label.current.textContent = CHAPTERS[active] ?? "";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      <span ref={label} className="chapter-label">
        {CHAPTERS[0]}
      </span>
      <div className="chapter-dots">
        {Array.from({ length: PAGES }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              dots.current[i] = el;
            }}
            className={`chapter-dot ${i === 0 ? "chapter-dot--on" : ""}`}
            title={CHAPTERS[i]}
          />
        ))}
      </div>
    </nav>
  );
}
