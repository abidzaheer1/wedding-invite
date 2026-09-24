"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { WeddingScene } from "@/components/wedding-scene";

export default function Home() {
  const [isAttending, setIsAttending] = useState(false);

  return (
    <main className="invite-shell">
      <WeddingScene />
      <nav className="topbar">
        <span className="monogram">J <i>&</i> L</span>
        <span className="nav-date">07.06.26 / ROME</span>
      </nav>
      <section className="invite-content">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          A new chapter begins
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          Julia <span>&amp;</span> Luca
        </motion.h1>
        <motion.p className="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
          We are getting married, and we would love to celebrate under the Roman sun with you.
        </motion.p>
        <motion.button className={`rsvp-button ${isAttending ? "confirmed" : ""}`} onClick={() => setIsAttending(!isAttending)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {isAttending ? "You are on the list" : "Join the celebration"}
          <span aria-hidden="true">↗</span>
        </motion.button>
      </section>
      <footer className="footer-note">
        <span>Saturday, July 6th</span>
        <span className="footer-line" />
        <span>Villa Aurelia</span>
      </footer>
    </main>
  );
}
