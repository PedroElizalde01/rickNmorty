import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import * as api from "@/lib/api";

jest.mock("@/lib/api");
const mockGetCharacters = api.getCharacters as jest.MockedFunction<typeof api.getCharacters>;
const mockGetEpisodes = api.getEpisodes as jest.MockedFunction<typeof api.getEpisodes>;

function makeCharacter(id: number, name: string, episodeIds: number[]) {
  return {
    id,
    name,
    status: "Alive" as const,
    species: "Human",
    image: `/char${id}.jpg`,
    episode: episodeIds.map((e) => `https://rickandmortyapi.com/api/episode/${e}`),
  };
}

const char1 = makeCharacter(1, "Rick Sanchez", [1, 2, 3]);
const char2 = makeCharacter(2, "Morty Smith", [2, 3, 4]);

const mockPage = {
  info: { count: 2, pages: 1, next: null, prev: null },
  results: [char1, char2],
};

const mockEpisodesData = [
  { id: 1, name: "Pilot", air_date: "Dec 2, 2013", episode: "S01E01", characters: [] },
  { id: 2, name: "Lawnmower Dog", air_date: "Dec 9, 2013", episode: "S01E02", characters: [] },
  { id: 3, name: "Anatomy Park", air_date: "Dec 16, 2013", episode: "S01E03", characters: [] },
  { id: 4, name: "M. Night Shaym-Aliens!", air_date: "Jan 13, 2014", episode: "S01E04", characters: [] },
];

describe("Home page", () => {
  beforeEach(() => {
    mockGetCharacters.mockResolvedValue(mockPage);
    mockGetEpisodes.mockResolvedValue(mockEpisodesData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the page title and both panels", async () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /episode compare/i })).toBeInTheDocument();
    expect(screen.getByText("Character #1")).toBeInTheDocument();
    expect(screen.getByText("Character #2")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Rick Sanchez").length).toBeGreaterThan(0);
    });
  });

  it("does not show episode sections before selecting both characters", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText("Rick Sanchez").length).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/Only Episodes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shared Episodes/)).not.toBeInTheDocument();
  });

  it("shows episode sections after selecting both characters", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText("Rick Sanchez").length).toBeGreaterThan(0);
    });

    const rickCards = screen.getAllByText("Rick Sanchez");
    await userEvent.click(rickCards[0]);

    expect(screen.queryByText(/Only Episodes/)).not.toBeInTheDocument();

    const mortyCards = screen.getAllByText("Morty Smith");
    await userEvent.click(mortyCards[1]);

    await waitFor(() => {
      expect(screen.getByText(/Character #1 — Only Episodes/)).toBeInTheDocument();
      expect(screen.getByText(/Characters #1 & #2 — Shared Episodes/)).toBeInTheDocument();
      expect(screen.getByText(/Character #2 — Only Episodes/)).toBeInTheDocument();
    });
  });

  it("displays fetched episode data after comparison", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText("Rick Sanchez").length).toBeGreaterThan(0);
    });

    await userEvent.click(screen.getAllByText("Rick Sanchez")[0]);
    await userEvent.click(screen.getAllByText("Morty Smith")[1]);

    await waitFor(() => {
      expect(screen.getByText("Pilot")).toBeInTheDocument();
    });

    expect(screen.getByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.getByText("Anatomy Park")).toBeInTheDocument();
    expect(screen.getByText("M. Night Shaym-Aliens!")).toBeInTheDocument();
  });
});
