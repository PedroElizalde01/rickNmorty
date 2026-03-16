import { renderHook, waitFor } from "@testing-library/react";
import { useEpisodeComparison } from "./useEpisodeComparison";
import { getEpisodes } from "@/lib/api";
import { makeCharacter, makeEpisode } from "@/tests/factories";
import type { Character } from "@/types/api";

jest.mock("@/lib/api");
const mockedGetEpisodes = jest.mocked(getEpisodes);

type Props = { c1: Character | null; c2: Character | null };

function renderComparison(c1: Character | null, c2: Character | null) {
  return renderHook(({ c1, c2 }: Props) => useEpisodeComparison(c1, c2), {
    initialProps: { c1, c2 },
  });
}

describe("useEpisodeComparison", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("is not ready when both characters are null", () => {
    const { result } = renderComparison(null, null);

    expect(result.current.ready).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("is not ready when only one character is selected", () => {
    const { result } = renderComparison(makeCharacter(1, [1, 2]), null);

    expect(result.current.ready).toBe(false);
    expect(mockedGetEpisodes).not.toHaveBeenCalled();
  });

  it("splits episodes into only-char1, shared, and only-char2", async () => {
    // char1: [1,2,3]  char2: [2,3,4,5]
    // expected → only1: [1], shared: [2,3], only2: [4,5]
    const char1 = makeCharacter(1, [1, 2, 3]);
    const char2 = makeCharacter(2, [2, 3, 4, 5]);
    mockedGetEpisodes.mockResolvedValueOnce([1, 2, 3, 4, 5].map(makeEpisode));

    const { result } = renderComparison(char1, char2);

    expect(result.current.ready).toBe(true);
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1)]);
    expect(result.current.shared).toEqual([makeEpisode(2), makeEpisode(3)]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(4), makeEpisode(5)]);
  });

  it("handles zero overlap between characters", async () => {
    mockedGetEpisodes.mockResolvedValueOnce([1, 2, 3, 4].map(makeEpisode));

    const { result } = renderComparison(
      makeCharacter(1, [1, 2]),
      makeCharacter(2, [3, 4]),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1), makeEpisode(2)]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(3), makeEpisode(4)]);
  });

  it("handles full overlap between characters", async () => {
    mockedGetEpisodes.mockResolvedValueOnce([1, 2, 3].map(makeEpisode));

    const { result } = renderComparison(
      makeCharacter(1, [1, 2, 3]),
      makeCharacter(2, [1, 2, 3]),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([1, 2, 3].map(makeEpisode));
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("de-duplicates episode IDs before fetching", async () => {
    // both characters share episode 5 — the fetch should only include it once
    mockedGetEpisodes.mockResolvedValueOnce([5, 6, 7].map(makeEpisode));

    const { result } = renderComparison(
      makeCharacter(1, [5, 6]),
      makeCharacter(2, [5, 7]),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const calledIds = mockedGetEpisodes.mock.calls[0][0];
    expect(calledIds.length).toBe(new Set(calledIds).size);
    expect([...calledIds].sort()).toEqual([5, 6, 7]);
  });

  it("correctly parses multi-digit episode IDs from URLs", async () => {
    // episode URLs end with /28 and /1 — make sure we get 28, not "8"
    const char1 = makeCharacter(1, [1, 28]);
    const char2 = makeCharacter(2, [28]);
    mockedGetEpisodes.mockResolvedValueOnce([makeEpisode(1), makeEpisode(28)]);

    const { result } = renderComparison(char1, char2);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1)]);
    expect(result.current.shared).toEqual([makeEpisode(28)]);
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("resets state when a character is deselected", async () => {
    mockedGetEpisodes.mockResolvedValueOnce([makeEpisode(1)]);

    const { result, rerender } = renderComparison(
      makeCharacter(1, [1]),
      makeCharacter(2, [1]),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shared).toHaveLength(1);

    rerender({ c1: makeCharacter(1, [1]), c2: null });

    expect(result.current.ready).toBe(false);
    expect(result.current.onlyChar1).toEqual([]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([]);
  });

  it("re-fetches when the selected character changes", async () => {
    mockedGetEpisodes
      .mockResolvedValueOnce([1, 2, 3].map(makeEpisode))
      .mockResolvedValueOnce([1, 2, 4, 5].map(makeEpisode));

    const { result, rerender } = renderComparison(
      makeCharacter(1, [1, 2]),
      makeCharacter(2, [2, 3]),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shared).toEqual([makeEpisode(2)]);

    // swap char2 for char3 — no overlap with char1
    rerender({ c1: makeCharacter(1, [1, 2]), c2: makeCharacter(3, [4, 5]) });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.onlyChar1).toEqual([makeEpisode(1), makeEpisode(2)]);
    expect(result.current.shared).toEqual([]);
    expect(result.current.onlyChar2).toEqual([makeEpisode(4), makeEpisode(5)]);
    expect(mockedGetEpisodes).toHaveBeenCalledTimes(2);
  });
});
