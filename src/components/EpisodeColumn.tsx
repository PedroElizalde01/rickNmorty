import { EpisodeItem } from "./EpisodeItem";
import type { Episode } from "@/types/api";

const LABELS = {
  left: "Character #1 — Only Episodes",
  center: "Characters #1 & #2 — Shared Episodes",
  right: "Character #2 — Only Episodes",
} as const;

type Variant = keyof typeof LABELS;

interface Props {
  variant: Variant;
  episodes: Episode[];
  onEpisodeClick?: (episode: Episode) => void;
}

export function EpisodeColumn({ variant, episodes, onEpisodeClick }: Props) {
  const isShared = variant === "center";

  return (
    <div className={`episode-col${isShared ? " shared" : ""}`}>
      <div className="episode-col-header">
        <h3 className="label" style={isShared ? { color: "var(--text-strong)" } : undefined}>
          {LABELS[variant]}
        </h3>
      </div>

      <div className="episode-col-body">
        {episodes.length === 0 ? (
          <p className="episode-empty">No episodes</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {episodes.map((ep) => (
              <EpisodeItem
                key={ep.id}
                code={ep.episode}
                name={ep.name}
                airDate={ep.air_date}
                onClick={() => onEpisodeClick?.(ep)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
