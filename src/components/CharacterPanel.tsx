import { CharacterCard } from "./CharacterCard";

const PLACEHOLDER_CHARACTERS = [
  { name: "Rick Sanchez", status: "Alive", species: "Human" },
  { name: "Morty Smith", status: "Alive", species: "Human" },
  { name: "Summer Smith", status: "Alive", species: "Human" },
  { name: "Beth Smith", status: "Alive", species: "Human" },
  { name: "Jerry Smith", status: "Alive", species: "Human" },
  { name: "Birdperson", status: "Dead", species: "Birdperson" },
] as const;

interface Props {
  label: string;
  selectedIndex?: number;
}

export function CharacterPanel({ label, selectedIndex }: Props) {
  const pages = ["1", "2", "3", "…", "42"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="panel-header">
        <h2 className="label">{label}</h2>
        <span className="page-indicator">page 1 / 42</span>
      </div>

      <div className="card-grid">
        {PLACEHOLDER_CHARACTERS.map((char, i) => (
          <CharacterCard
            key={char.name}
            name={char.name}
            status={char.status}
            species={char.species}
            selected={i === selectedIndex}
          />
        ))}
      </div>

      <div className="pagination">
        <button className="page-btn">←</button>
        {pages.map((p) => (
          <button key={p} className={`page-btn${p === "1" ? " active" : ""}`}>
            {p}
          </button>
        ))}
        <button className="page-btn">→</button>
      </div>
    </div>
  );
}
