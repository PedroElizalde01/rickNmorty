import { compareEpisodes, extractEpisodeIds } from "./compareEpisodes";
import type { Episode } from "@/types/api";

function makeEpisode(id: number): Episode {
  return {
    id,
    name: `Episode ${id}`,
    air_date: `Jan ${id}, 2014`,
    episode: `S01E${String(id).padStart(2, "0")}`,
    characters: [],
  };
}

function makeMap(ids: number[]): Map<number, Episode> {
  const map = new Map<number, Episode>();
  for (const id of ids) map.set(id, makeEpisode(id));
  return map;
}

describe("compareEpisodes", () => {
  it("splits episodes with partial overlap", () => {
    const episodes = makeMap([1, 2, 3, 4, 5]);
    const result = compareEpisodes([1, 2, 3], [3, 4, 5], episodes);

    expect(result.onlyChar1.map((e) => e.id)).toEqual([1, 2]);
    expect(result.shared.map((e) => e.id)).toEqual([3]);
    expect(result.onlyChar2.map((e) => e.id)).toEqual([4, 5]);
  });

  it("handles no overlap", () => {
    const episodes = makeMap([1, 2, 3, 4]);
    const result = compareEpisodes([1, 2], [3, 4], episodes);

    expect(result.onlyChar1.map((e) => e.id)).toEqual([1, 2]);
    expect(result.shared).toEqual([]);
    expect(result.onlyChar2.map((e) => e.id)).toEqual([3, 4]);
  });

  it("handles full overlap", () => {
    const episodes = makeMap([1, 2, 3]);
    const result = compareEpisodes([1, 2, 3], [1, 2, 3], episodes);

    expect(result.onlyChar1).toEqual([]);
    expect(result.shared.map((e) => e.id)).toEqual([1, 2, 3]);
    expect(result.onlyChar2).toEqual([]);
  });

  it("handles same character selected twice", () => {
    const episodes = makeMap([5, 10, 15]);
    const result = compareEpisodes([5, 10, 15], [5, 10, 15], episodes);

    expect(result.onlyChar1).toEqual([]);
    expect(result.shared.map((e) => e.id)).toEqual([5, 10, 15]);
    expect(result.onlyChar2).toEqual([]);
  });

  it("handles one character with many episodes and one with few", () => {
    const episodes = makeMap([1, 2, 3, 4, 5]);
    const result = compareEpisodes([1, 2, 3, 4, 5], [3], episodes);

    expect(result.onlyChar1.map((e) => e.id)).toEqual([1, 2, 4, 5]);
    expect(result.shared.map((e) => e.id)).toEqual([3]);
    expect(result.onlyChar2).toEqual([]);
  });

  it("handles empty episode lists", () => {
    const episodes = makeMap([]);
    const result = compareEpisodes([], [], episodes);

    expect(result.onlyChar1).toEqual([]);
    expect(result.shared).toEqual([]);
    expect(result.onlyChar2).toEqual([]);
  });

  it("handles one empty and one populated", () => {
    const episodes = makeMap([1, 2]);
    const result = compareEpisodes([1, 2], [], episodes);

    expect(result.onlyChar1.map((e) => e.id)).toEqual([1, 2]);
    expect(result.shared).toEqual([]);
    expect(result.onlyChar2).toEqual([]);
  });

  it("skips episode ids not present in the map", () => {
    const episodes = makeMap([1, 3]);
    const result = compareEpisodes([1, 2, 3], [3, 4], episodes);

    expect(result.onlyChar1.map((e) => e.id)).toEqual([1]);
    expect(result.shared.map((e) => e.id)).toEqual([3]);
    expect(result.onlyChar2).toEqual([]);
  });
});

describe("extractEpisodeIds", () => {
  it("extracts ids from episode URLs", () => {
    const urls = [
      "https://rickandmortyapi.com/api/episode/1",
      "https://rickandmortyapi.com/api/episode/28",
      "https://rickandmortyapi.com/api/episode/51",
    ];
    expect(extractEpisodeIds(urls)).toEqual([1, 28, 51]);
  });

  it("returns empty array for empty input", () => {
    expect(extractEpisodeIds([])).toEqual([]);
  });
});
