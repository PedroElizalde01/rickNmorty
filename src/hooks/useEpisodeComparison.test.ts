import { renderHook, act, waitFor } from "@testing-library/react";
import { useEpisodeComparison } from "./useEpisodeComparison";
import type { Character, Episode } from "@/types/api";

jest.mock("@/lib/api");
import { getEpisodes } from "@/lib/api";

const mockedGetEpisodes = getEpisodes as jest.MockedFunction<
  typeof getEpisodes
>;

function makeCharacter(
  id: number,
  episodeIds: number[],
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

function makeEpisode(id: number): Episode {
  return {
    id,
    name: `Episode ${id}`,
    air_date: "January 1, 2020",
    episode: `S01E${String(id).padStart(2, "0")}`,
  };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("useEpisodeComparison", () => {
  it("returns not ready when both characters are null", () => {
    const { result } = renderHook(() => useEpisodeComparison(null, null));

    expect(result.current.ready).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("returns not ready when only one character is selected", () => {
    const char1 = makeCharacter(1, [1, 2, 3]);

    const { result } = renderHook(() => useEpisodeComparison(char1, null));

    expect(result.current.ready).toBe(false);
    expect(mockedGetEpisodes).not.toHaveBeenCalled();
  });

  it("fetches episodes and categorises them correctly", async () => {
    // char1 has episodes 1, 2, 3
    // char2 has episodes 2, 3, 4, 5
    // shared: 2, 3 | only char1: 1 | only char2: 4, 5
    const char1 = makeCharacter(1, [1, 2, 3]);
    const char2 = makeCharacter(2, [2, 3, 4, 5]);

    const allEpisodes = [1, 2, 3, 4, 5].map(makeEpisode);
    mockedGetEpisodes.mockResolvedValueOnce(allEpisodes);

    const { result } = renderHook(() => useEpisodeComparison(char1, char2));

    expect(result.current.ready).toBe(true);
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1)]);
    expect(result.current.shared).toEqual([makeEpisode(2), makeEpisode(3)]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(4), makeEpisode(5)]);

    // Should have been called with the union of all episode IDs
    const calledIds = mockedGetEpisodes.mock.calls[0][0];
    expect(calledIds.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles characters with no shared episodes", async () => {
    const char1 = makeCharacter(1, [1, 2]);
    const char2 = makeCharacter(2, [3, 4]);

    mockedGetEpisodes.mockResolvedValueOnce([1, 2, 3, 4].map(makeEpisode));

    const { result } = renderHook(() => useEpisodeComparison(char1, char2));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1), makeEpisode(2)]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(3), makeEpisode(4)]);
  });

  it("handles characters with all shared episodes", async () => {
    const char1 = makeCharacter(1, [1, 2, 3]);
    const char2 = makeCharacter(2, [1, 2, 3]);

    mockedGetEpisodes.mockResolvedValueOnce([1, 2, 3].map(makeEpisode));

    const { result } = renderHook(() => useEpisodeComparison(char1, char2));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([1, 2, 3].map(makeEpisode));
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("de-duplicates episode IDs before fetching", async () => {
    // Both characters share episode 5 — it should appear once in the fetch
    const char1 = makeCharacter(1, [5, 6]);
    const char2 = makeCharacter(2, [5, 7]);

    mockedGetEpisodes.mockResolvedValueOnce([5, 6, 7].map(makeEpisode));

    const { result } = renderHook(() => useEpisodeComparison(char1, char2));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const calledIds = mockedGetEpisodes.mock.calls[0][0];
    // No duplicates
    expect(calledIds.length).toBe(new Set(calledIds).size);
    expect(calledIds.sort()).toEqual([5, 6, 7]);
  });

  it("resets when a character is deselected", async () => {
    const char1 = makeCharacter(1, [1]);
    const char2 = makeCharacter(2, [1]);

    mockedGetEpisodes.mockResolvedValueOnce([makeEpisode(1)]);

    const { result, rerender } = renderHook(
      ({ c1, c2 }) => useEpisodeComparison(c1, c2),
      { initialProps: { c1: char1 as Character | null, c2: char2 as Character | null } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shared).toHaveLength(1);

    // Deselect char2
    rerender({ c1: char1, c2: null });

    expect(result.current.ready).toBe(false);
    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("re-fetches when characters change", async () => {
    const char1 = makeCharacter(1, [1, 2]);
    const char2 = makeCharacter(2, [2, 3]);
    const char3 = makeCharacter(3, [4, 5]);

    mockedGetEpisodes
      .mockResolvedValueOnce([1, 2, 3].map(makeEpisode))
      .mockResolvedValueOnce([1, 2, 4, 5].map(makeEpisode));

    const { result, rerender } = renderHook(
      ({ c1, c2 }) => useEpisodeComparison(c1, c2),
      { initialProps: { c1: char1 as Character | null, c2: char2 as Character | null } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shared).toEqual([makeEpisode(2)]);

    // Switch char2 → char3
    rerender({ c1: char1, c2: char3 });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1), makeEpisode(2)]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(4), makeEpisode(5)]);
    expect(mockedGetEpisodes).toHaveBeenCalledTimes(2);
  });

  it("extracts episode IDs from various URL formats", async () => {
    const char1: Character = {
      id: 1,
      name: "Rick",
      status: "Alive",
      species: "Human",
      image: "img.jpg",
      episode: [
        "https://rickandmortyapi.com/api/episode/28",
        "https://rickandmortyapi.com/api/episode/1",
      ],
    };
    const char2: Character = {
      id: 2,
      name: "Morty",
      status: "Alive",
      species: "Human",
      image: "img.jpg",
      episode: ["https://rickandmortyapi.com/api/episode/28"],
    };

    mockedGetEpisodes.mockResolvedValueOnce([makeEpisode(1), makeEpisode(28)]);

    const { result } = renderHook(() => useEpisodeComparison(char1, char2));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1)]);
    expect(result.current.shared).toEqual([makeEpisode(28)]);
    expect(result.current.onlyChar2).toEqual([]);
  });
});
