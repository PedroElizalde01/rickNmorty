import { getCharacters, getCharactersByIds, getEpisodes } from "./api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

describe("getCharacters", () => {
  it("fetches characters for the given page", async () => {
    const mockData = { info: { count: 1, pages: 1, next: null, prev: null }, results: [] };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await getCharacters(3);

    expect(mockFetch).toHaveBeenCalledWith("/api/characters?page=3", { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(getCharacters(1)).rejects.toThrow("Failed to fetch characters (500)");
  });

  it("passes abort signal", async () => {
    const mockData = { info: {}, results: [] };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });
    const controller = new AbortController();

    await getCharacters(1, controller.signal);

    expect(mockFetch).toHaveBeenCalledWith("/api/characters?page=1", { signal: controller.signal });
  });
});

describe("getCharactersByIds", () => {
  it("returns empty array for empty ids", async () => {
    const result = await getCharactersByIds([]);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches characters by ids", async () => {
    const mockData = [{ id: 1, name: "Rick" }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await getCharactersByIds([1, 2]);

    expect(mockFetch).toHaveBeenCalledWith("/api/characters?ids=1,2", { signal: undefined });
    expect(result).toEqual(mockData);
  });
});

describe("getEpisodes", () => {
  it("returns empty array for empty ids", async () => {
    const result = await getEpisodes([]);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches episodes by ids", async () => {
    const mockData = [{ id: 1, name: "Pilot" }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await getEpisodes([1, 2, 3]);

    expect(mockFetch).toHaveBeenCalledWith("/api/episodes?ids=1,2,3", { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 });

    await expect(getEpisodes([1])).rejects.toThrow("Failed to fetch episodes (429)");
  });
});
