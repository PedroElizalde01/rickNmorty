import type { Character, Episode, PaginatedResponse } from "@/types/api";

export function makeCharacter(
  id: number,
  episodeIds: number[] = [1],
): Character {
  return {
    id,
    name: `Character ${id}`,
    status: "Alive",
    species: "Human",
    image: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`,
    episode: episodeIds.map(
      (eid) => `https://rickandmortyapi.com/api/episode/${eid}`,
    ),
  };
}

export function makeEpisode(id: number): Episode {
  return {
    id,
    name: `Episode ${id}`,
    air_date: "January 1, 2020",
    episode: `S01E${String(id).padStart(2, "0")}`,
    characters: [],
  };
}

export function makePage(
  page: number,
  totalPages: number,
  results: Character[] = [],
): PaginatedResponse<Character> {
  return {
    info: {
      count: totalPages * 20,
      pages: totalPages,
      next:
        page < totalPages
          ? `https://rickandmortyapi.com/api/character?page=${page + 1}`
          : null,
      prev:
        page > 1
          ? `https://rickandmortyapi.com/api/character?page=${page - 1}`
          : null,
    },
    results,
  };
}
