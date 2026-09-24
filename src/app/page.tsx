import { ChapterNav } from "@/components/chapter-nav";
import { WeddingScene } from "@/components/wedding-scene";
import { wedding } from "@/data/wedding";

export default function Home() {
  return (
    <main className="invite-shell">
      <header className="topbar">
        <span className="monogram">
          {wedding.groom.name[0]} <i>&amp;</i> {wedding.bride.name[0]}
        </span>
        <span className="nav-date">
          {wedding.nikah.date.split(",")[1]?.trim()} · {wedding.city}
        </span>
      </header>
      <ChapterNav />
      <WeddingScene />
    </main>
  );
}
