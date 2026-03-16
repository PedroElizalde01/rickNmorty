"use client";

import { useCallback, useState } from "react";
import { CharacterPanel } from "@/components/CharacterPanel";
import { EpisodeColumn } from "@/components/EpisodeColumn";
import { useEpisodeComparison } from "@/hooks/useEpisodeComparison";
import type { Character } from "@/types/api";

export default function Home() {
  const [char1, setChar1] = useState<Character | null>(null);
  const [char2, setChar2] = useState<Character | null>(null);

  const handleSelect1 = useCallback((c: Character) => setChar1(c), []);
  const handleSelect2 = useCallback((c: Character) => setChar2(c), []);

  const comparison = useEpisodeComparison(char1, char2);

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
          <CharacterPanel label="Character #1" selectedId={char1?.id ?? null} onSelect={handleSelect1} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} />

          <CharacterPanel label="Character #2" selectedId={char2?.id ?? null} onSelect={handleSelect2} />
        </div>
      </section>

      {comparison.ready && (
        <section style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div
            className="episode-layout"
            style={comparison.loading ? { opacity: 0.4, pointerEvents: "none" } : undefined}
          >
            <EpisodeColumn variant="left" episodes={comparison.onlyChar1} />
            <EpisodeColumn variant="center" episodes={comparison.shared} />
            <EpisodeColumn variant="right" episodes={comparison.onlyChar2} />
          </div>
        </section>
      )}
    </div>
  );
}
