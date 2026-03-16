import type { Episode } from "@/types/api";

interface ComparisonResult {
  onlyChar1: Episode[];
  shared: Episode[];
  onlyChar2: Episode[];
}

export function compareEpisodes(
  ids1: number[],
  ids2: number[],
  episodes: Map<number, Episode>,
): ComparisonResult {
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
}

export function extractEpisodeIds(episodeUrls: string[]): number[] {
  return episodeUrls.map((url) => Number(url.split("/").pop()));
}
