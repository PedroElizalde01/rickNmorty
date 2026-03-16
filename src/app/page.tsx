import { CharacterPanel } from "@/components/CharacterPanel";
import { EpisodeColumn } from "@/components/EpisodeColumn";

export default function Home() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Episode Compare
          <span>/ Rick &amp; Morty</span>
        </h1>
      </header>

      <section>
        <div className="character-layout">
          <CharacterPanel label="Character #1" selectedIndex={0} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} />

          <CharacterPanel label="Character #2" />
        </div>
      </section>

      {/* <div className="divider" /> */}

      <section style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div className="episode-layout">
          <EpisodeColumn variant="left" />
          <EpisodeColumn variant="center" />
          <EpisodeColumn variant="right" />
        </div>
      </section>
    </div>
  );
}
