"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Character, Episode } from "@/types/api";
import { getEpisodes } from "@/lib/api";

function extractEpisodeIds(character: Character): number[] {
  return character.episode.map((url) => Number(url.split("/").pop()));
}

export function useEpisodeComparison(char1: Character | null, char2: Character | null) {
  const [episodes, setEpisodes] = useState<Map<number, Episode>>(new Map());
  const [loading, setLoading] = useState(false);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  const id1 = char1?.id ?? null;
  const id2 = char2?.id ?? null;
  const currentKey = id1 !== null && id2 !== null ? `${id1}-${id2}` : null;

  const ids1 = useMemo(() => (char1 ? extractEpisodeIds(char1) : []), [char1?.id]);
  const ids2 = useMemo(() => (char2 ? extractEpisodeIds(char2) : []), [char2?.id]);

  const ids1Ref = useRef(ids1);
  const ids2Ref = useRef(ids2);
  ids1Ref.current = ids1;
  ids2Ref.current = ids2;

  useEffect(() => {
    if (id1 === null || id2 === null) {
      setEpisodes(new Map());
      setFetchedKey(null);
      return;
    }

    const key = `${id1}-${id2}`;
    const allIds = [...new Set([...ids1Ref.current, ...ids2Ref.current])];
    const controller = new AbortController();
    setLoading(true);

    getEpisodes(allIds, controller.signal)
      .then((data) => {
        const map = new Map<number, Episode>();
        for (const ep of data) map.set(ep.id, ep);
        setEpisodes(map);
        setFetchedKey(key);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [id1, id2]);

  const dataReady = fetchedKey === currentKey && !loading;

  const { onlyChar1, shared, onlyChar2 } = useMemo(() => {
    if (!dataReady) return { onlyChar1: [], shared: [], onlyChar2: [] };

    const set1 = new Set(ids1);
    const set2 = new Set(ids2);
    const only1: Episode[] = [];
    const common: Episode[] = [];
    const only2: Episode[] = [];

    for (const id of set1) {
      const ep = episodes.get(id);
      if (!ep) continue;
      if (set2.has(id)) common.push(ep);
      else only1.push(ep);
    }
    for (const id of set2) {
      if (set1.has(id)) continue;
      const ep = episodes.get(id);
      if (ep) only2.push(ep);
    }

    return { onlyChar1: only1, shared: common, onlyChar2: only2 };
  }, [dataReady, ids1, ids2, episodes]);

  return {
    ready: currentKey !== null,
    loading: loading || (currentKey !== null && !dataReady),
    onlyChar1,
    shared,
    onlyChar2,
  };
}
