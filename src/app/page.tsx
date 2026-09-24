import { WeddingScene } from "@/components/wedding-scene";

export default function Home() {
  return (
    <main className="invite-shell">
      <header className="topbar">
        <span className="monogram">
          J <i>&amp;</i> L
        </span>
        <span className="nav-date">07.06.26 · ROMA</span>
      </header>
      <WeddingScene />
    </main>
  );
}
