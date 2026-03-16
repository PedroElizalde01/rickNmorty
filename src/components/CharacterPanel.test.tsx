import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CharacterPanel } from "./CharacterPanel";
import * as api from "@/lib/api";

jest.mock("@/lib/api");
const mockGetCharacters = api.getCharacters as jest.MockedFunction<typeof api.getCharacters>;

const mockCharactersPage1 = {
  info: { count: 826, pages: 42, next: "next", prev: null },
  results: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Character ${i + 1}`,
    status: "Alive" as const,
    species: "Human",
    image: `/char${i + 1}.jpg`,
    episode: [`https://rickandmortyapi.com/api/episode/${i + 1}`],
  })),
};

describe("CharacterPanel", () => {
  beforeEach(() => {
    mockGetCharacters.mockResolvedValue(mockCharactersPage1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the panel label and fetches characters", async () => {
    render(<CharacterPanel label="Character #1" />);

    expect(screen.getByText("Character #1")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Character 1")).toBeInTheDocument();
    });
  });

  it("shows only 8 characters per page", async () => {
    render(<CharacterPanel label="Character #1" />);

    await waitFor(() => {
      expect(screen.getByText("Character 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Character 8")).toBeInTheDocument();
    expect(screen.queryByText("Character 9")).not.toBeInTheDocument();
  });

  it("shows page indicator", async () => {
    render(<CharacterPanel label="Character #1" />);

    await waitFor(() => {
      expect(screen.getByText("page 1 / 42")).toBeInTheDocument();
    });
  });

  it("calls onSelect with the character when a card is clicked", async () => {
    const onSelect = jest.fn();
    render(<CharacterPanel label="Character #1" onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("Character 1")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Character 1"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: "Character 1" }),
    );
  });

  it("highlights the selected character", async () => {
    render(<CharacterPanel label="Character #1" selectedId={3} />);

    await waitFor(() => {
      expect(screen.getByText("Character 3")).toBeInTheDocument();
    });

    const selectedCards = document.querySelectorAll(".card.selected");
    expect(selectedCards).toHaveLength(1);
  });

  it("disables prev button on first page", async () => {
    render(<CharacterPanel label="Character #1" />);

    await waitFor(() => {
      expect(screen.getByText("Character 1")).toBeInTheDocument();
    });

    expect(screen.getByText("←")).toBeDisabled();
  });

  it("navigates to next page", async () => {
    const page2 = {
      info: { count: 826, pages: 42, next: "next", prev: "prev" },
      results: Array.from({ length: 20 }, (_, i) => ({
        id: i + 21,
        name: `Character ${i + 21}`,
        status: "Alive" as const,
        species: "Human",
        image: `/char${i + 21}.jpg`,
        episode: [],
      })),
    };
    mockGetCharacters.mockResolvedValueOnce(mockCharactersPage1).mockResolvedValueOnce(page2);

    render(<CharacterPanel label="Character #1" />);

    await waitFor(() => {
      expect(screen.getByText("Character 1")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("→"));

    await waitFor(() => {
      expect(screen.getByText("Character 21")).toBeInTheDocument();
    });
  });
});
