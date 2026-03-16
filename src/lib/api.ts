import type { Character, Episode, PaginatedResponse } from "@/types/api";

export async function getCharacters(page: number, signal?: AbortSignal): Promise<PaginatedResponse<Character>> {
  const res = await fetch(`/api/characters?page=${page}`, { signal });
  if (!res.ok) throw new Error(`Failed to fetch characters (${res.status})`);
  return res.json();
}

export async function getCharactersByIds(ids: number[], signal?: AbortSignal): Promise<Character[]> {
  if (ids.length === 0) return [];
  const res = await fetch(`/api/characters?ids=${ids.join(",")}`, { signal });
  if (!res.ok) throw new Error(`Failed to fetch characters (${res.status})`);
  return res.json();
}

export async function getEpisodes(ids: number[], signal?: AbortSignal): Promise<Episode[]> {
  if (ids.length === 0) return [];
  const res = await fetch(`/api/episodes?ids=${ids.join(",")}`, { signal });
  if (!res.ok) throw new Error(`Failed to fetch episodes (${res.status})`);
  return res.json();
}
