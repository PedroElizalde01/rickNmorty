"use client";

interface Props {
  name: string;
  status: "Alive" | "Dead" | "unknown";
  species: string;
  image: string;
  selected?: boolean;
  onClick?: () => void;
}

const STATUS_COLORS = {
  Alive: "#6fcf97",
  Dead: "#eb5757",
  unknown: "#9f938e",
};

export function CharacterCard({ name, status, species, image, selected = false, onClick }: Props) {
  return (
    <article className={`card${selected ? " selected" : ""}`} onClick={onClick}>
      <img
        src={image}
        alt={name}
        className="card-avatar"
        onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
      />

      <div className="flex flex-col gap-1 min-w-0">
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
