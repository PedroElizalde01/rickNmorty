interface Props {
  name: string;
  status: "Alive" | "Dead" | "unknown";
  species: string;
  selected?: boolean;
}

const STATUS_COLORS = {
  Alive: "#6fcf97",
  Dead: "#eb5757",
  unknown: "#9f938e",
};

export function CharacterCard({ name, status, species, selected = false }: Props) {
  return (
    <article className={`card${selected ? " selected" : ""}`}>
      <div className="card-avatar" />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: 0 }}>
        <span className="card-name">{name}</span>
        <span className="card-meta">
          <span className="status-dot" style={{ background: STATUS_COLORS[status] }} />
          {status} — {species}
        </span>
      </div>

      {selected && <span className="selected-tag">selected</span>}
    </article>
  );
}
