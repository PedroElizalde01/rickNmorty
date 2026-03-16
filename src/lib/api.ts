import type { Character, PaginatedResponse } from "@/types/api";

export async function getCharacters(page: number, signal?: AbortSignal): Promise<PaginatedResponse<Character>> {
  const res = await fetch(`/api/characters?page=${page}`, { signal });
  if (!res.ok) throw new Error(`Failed to fetch characters (${res.status})`);
  return res.json();
}
