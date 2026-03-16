"use client";

import { CharacterCard } from "./CharacterCard";
import { useCharacters } from "@/hooks/useCharacters";
import type { Character } from "@/types/api";

interface Props {
  label: string;
  selectedId?: number | null;
  onSelect?: (char: Character) => void;
}

export function CharacterPanel({ label, selectedId, onSelect }: Props) {
  const { characters, page, totalPages, loading, error, goToPage } = useCharacters();

  function getPaginationRange(): (number | "…")[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, "…", totalPages];
    if (page >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="panel-header">
        <h2 className="label">{label}</h2>
        <span className="page-indicator">page {page} / {totalPages}</span>
      </div>

      {error && (
        <p style={{ color: "#eb5757", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}

      <div className="card-grid" style={loading ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
        {characters.length === 0
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card" />
            ))
          : characters.slice(0, 8).map((char) => (
              <CharacterCard
                key={char.id}
                name={char.name}
                status={char.status}
                species={char.species}
                image={char.image}
                selected={char.id === selectedId}
                onClick={() => onSelect?.(char)}
              />
            ))}
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => goToPage(page - 1)}
        >
          ←
        </button>

        {getPaginationRange().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="page-btn" style={{ cursor: "default", border: "none" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? " active" : ""}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => goToPage(page + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
