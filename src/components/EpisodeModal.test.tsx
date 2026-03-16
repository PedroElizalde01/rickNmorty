import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EpisodeModal } from "./EpisodeModal";
import type { Episode } from "@/types/api";
import * as api from "@/lib/api";

jest.mock("@/lib/api");
const mockGetCharactersByIds = api.getCharactersByIds as jest.MockedFunction<typeof api.getCharactersByIds>;

const mockEpisode: Episode = {
  id: 1,
  name: "Pilot",
  air_date: "December 2, 2013",
  episode: "S01E01",
  characters: [
    "https://rickandmortyapi.com/api/character/1",
    "https://rickandmortyapi.com/api/character/2",
  ],
};

const mockCharacters = [
  { id: 1, name: "Rick Sanchez", status: "Alive" as const, species: "Human", image: "/rick.jpg", episode: [] },
  { id: 2, name: "Morty Smith", status: "Alive" as const, species: "Human", image: "/morty.jpg", episode: [] },
];

describe("EpisodeModal", () => {
  beforeEach(() => {
    mockGetCharactersByIds.mockResolvedValue(mockCharacters);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders episode info and fetches characters", async () => {
    render(<EpisodeModal episode={mockEpisode} onClose={jest.fn()} />);

    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("December 2, 2013")).toBeInTheDocument();
    expect(screen.getByText("Characters (2)")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
      expect(screen.getByText("Morty Smith")).toBeInTheDocument();
    });

    expect(mockGetCharactersByIds).toHaveBeenCalledWith([1, 2], expect.any(AbortSignal));
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = jest.fn();
    render(<EpisodeModal episode={mockEpisode} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = jest.fn();
    const { container } = render(<EpisodeModal episode={mockEpisode} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    });

    await userEvent.click(container.querySelector(".modal-backdrop")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = jest.fn();
    render(<EpisodeModal episode={mockEpisode} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    });

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
