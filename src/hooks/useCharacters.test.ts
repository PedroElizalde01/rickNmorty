import { renderHook, act, waitFor } from "@testing-library/react";
import { useCharacters } from "./useCharacters";
import { getCharacters } from "@/lib/api";
import { makeCharacter, makePage } from "@/tests/factories";
import type { Character, PaginatedResponse } from "@/types/api";

jest.mock("@/lib/api");
const mockedGetCharacters = jest.mocked(getCharacters);

describe("useCharacters", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

  it("ignores AbortError without setting error state", async () => {
    // simulate what happens when the hook unmounts mid-flight:
    // the effect cleanup calls controller.abort(), which rejects with AbortError
    let rejectFetch!: (err: Error) => void;

    mockedGetCharacters.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        }),
    );

    const { result, unmount } = renderHook(() => useCharacters());

    expect(result.current.loading).toBe(true);

    // unmount triggers abort → the hook's catch should silently ignore it
    unmount();

    await act(async () => {
      rejectFetch(new DOMException("Aborted", "AbortError"));
    });

    // no error was set — the hook swallowed the AbortError
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

    act(() => result.current.goToPage(2));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.page).toBe(2);
    expect(result.current.characters).toEqual(page2);
    expect(mockedGetCharacters).toHaveBeenCalledTimes(2);
    expect(mockedGetCharacters).toHaveBeenLastCalledWith(2, expect.any(AbortSignal));
  });

  it("aborts the in-flight request when page changes", async () => {
    const resolvers: Array<(v: PaginatedResponse<Character>) => void> = [];

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

    // first fetch is in-flight
    expect(resolvers).toHaveLength(1);

    act(() => result.current.goToPage(2));

    // page change triggered a second fetch, first one was aborted
    expect(resolvers).toHaveLength(2);

    await act(async () => {
      resolvers[1](makePage(2, 3, [makeCharacter(21)]));
    });

    expect(result.current.page).toBe(2);
    expect(result.current.characters[0].id).toBe(21);
    expect(result.current.error).toBeNull();
  });
});
