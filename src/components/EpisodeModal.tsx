"use client";

import { useEffect, useState } from "react";
import type { Character, Episode } from "@/types/api";
import { getCharactersByIds } from "@/lib/api";

interface Props {
  episode: Episode;
  onClose: () => void;
}

export function EpisodeModal({ episode, onClose }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const ids = episode.characters.map((url) => Number(url.split("/").pop()));

    getCharactersByIds(ids, controller.signal)
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [episode.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="episode-code">{episode.episode}</span>
            <h2 className="modal-title">{episode.name}</h2>
            <span className="episode-date">{episode.air_date}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <h3 className="label mb-3">
            Characters ({episode.characters.length})
          </h3>

          {loading ? (
            <div className="modal-grid">
              {Array.from({ length: Math.min(episode.characters.length, 12) }).map((_, i) => (
                <div key={i} className="modal-char opacity-30">
                  <div className="modal-char-avatar" />
                  <span className="modal-char-name w-[60px] h-[10px] bg-[var(--line)] rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="modal-grid">
              {characters.map((char) => (
                <div key={char.id} className="modal-char">
                  <img src={char.image} alt={char.name} className="modal-char-avatar" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                  <span className="modal-char-name">{char.name}</span>
                  <span className="modal-char-species">{char.species}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
