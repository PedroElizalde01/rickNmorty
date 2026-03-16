import { EpisodeItem } from "./EpisodeItem";

const PLACEHOLDER_EPISODES = [
  { code: "S01E01", name: "Pilot", airDate: "Dec 2, 2013" },
  { code: "S01E02", name: "Lawnmower Dog", airDate: "Dec 9, 2013" },
  { code: "S01E03", name: "Anatomy Park", airDate: "Dec 16, 2013" },
  { code: "S01E06", name: "Rick Potion #9", airDate: "Jan 27, 2014" },
  { code: "S02E01", name: "A Rickle in Time", airDate: "Jul 26, 2015" },
];

const LABELS = {
  left: "Character #1 — Only Episodes",
  center: "Characters #1 & #2 — Shared Episodes",
  right: "Character #2 — Only Episodes",
} as const;

type Variant = keyof typeof LABELS;

interface Props {
  variant: Variant;
  empty?: boolean;
}

export function EpisodeColumn({ variant, empty = false }: Props) {
  const isShared = variant === "center";

  return (
    <div className={`episode-col${isShared ? " shared" : ""}`}>
      <div className="episode-col-header">
        <h3 className="label" style={isShared ? { color: "var(--text-strong)" } : undefined}>
          {LABELS[variant]}
        </h3>
      </div>

      <div className="episode-col-body">
        {empty ? (
          <p className="episode-empty">
            Select a character in both panels to compare episodes.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PLACEHOLDER_EPISODES.map((ep) => (
              <EpisodeItem key={ep.code} code={ep.code} name={ep.name} airDate={ep.airDate} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
