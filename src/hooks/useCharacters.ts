"use client";

import { useEffect, useState, useCallback } from "react";
import type { Character } from "@/types/api";
import { getCharacters } from "@/lib/api";

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCharacters(page, controller.signal)
      .then((data) => {
        setCharacters(data.results);
        setTotalPages(data.info.pages);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return { characters, page, totalPages, loading, error, goToPage };
}
