import { renderHook, act, waitFor } from "@testing-library/react";
import { useCharacters } from "./useCharacters";
import type { Character, PaginatedResponse } from "@/types/api";

jest.mock("@/lib/api");
import { getCharacters } from "@/lib/api";

const mockedGetCharacters = getCharacters as jest.MockedFunction<
  typeof getCharacters
>;

function makePage(
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

function makeCharacter(id: number): Character {
  return {
    id,
    name: `Character ${id}`,
    status: "Alive",
    species: "Human",
    image: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`,
    episode: [`https://rickandmortyapi.com/api/episode/1`],
  };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("useCharacters", () => {
  it("fetches page 1 on mount and exposes results", async () => {
    const chars = [makeCharacter(1), makeCharacter(2)];
    mockedGetCharacters.mockResolvedValueOnce(makePage(1, 3, chars));

    const { result } = renderHook(() => useCharacters());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.characters).toEqual(chars);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.error).toBeNull();
    expect(mockedGetCharacters).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  });

  it("sets error when fetch fails", async () => {
    mockedGetCharacters.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Server error");
    expect(result.current.characters).toEqual([]);
  });

  it("ignores AbortError (does not set error state)", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    mockedGetCharacters.mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => useCharacters());

    // Give time for the rejection to process
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // loading stays true because the AbortError handler returns early
    // without calling setLoading(false)
    expect(result.current.error).toBeNull();
  });

  it("navigates to a different page with goToPage", async () => {
    const page1 = [makeCharacter(1)];
    const page2 = [makeCharacter(21)];

    mockedGetCharacters
      .mockResolvedValueOnce(makePage(1, 3, page1))
      .mockResolvedValueOnce(makePage(2, 3, page2));

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.characters).toEqual(page1);

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.page).toBe(2);
    expect(result.current.characters).toEqual(page2);
    expect(mockedGetCharacters).toHaveBeenCalledTimes(2);
    expect(mockedGetCharacters).toHaveBeenLastCalledWith(
      2,
      expect.any(AbortSignal),
    );
  });

  it("aborts the previous request when page changes", async () => {
    let resolvers: Array<(v: PaginatedResponse<Character>) => void> = [];

    mockedGetCharacters.mockImplementation(
      (_page, signal) =>
        new Promise<PaginatedResponse<Character>>((resolve, reject) => {
          resolvers.push(resolve);
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const { result } = renderHook(() => useCharacters());

    // First fetch is in-flight
    expect(resolvers).toHaveLength(1);

    // Navigate to page 2 — should abort first request
    act(() => {
      result.current.goToPage(2);
    });

    // Second fetch started
    expect(resolvers).toHaveLength(2);

    // Resolve second request
    await act(async () => {
      resolvers[1](makePage(2, 3, [makeCharacter(21)]));
    });

    expect(result.current.page).toBe(2);
    expect(result.current.characters[0].id).toBe(21);
    expect(result.current.error).toBeNull();
  });
});
