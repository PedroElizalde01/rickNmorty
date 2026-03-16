import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EpisodeColumn } from "./EpisodeColumn";
import type { Episode } from "@/types/api";

const mockEpisodes: Episode[] = [
  { id: 1, name: "Pilot", air_date: "Dec 2, 2013", episode: "S01E01", characters: [] },
  { id: 2, name: "Lawnmower Dog", air_date: "Dec 9, 2013", episode: "S01E02", characters: [] },
];

describe("EpisodeColumn", () => {
  it("renders the correct header for each variant", () => {
    const { rerender } = render(<EpisodeColumn variant="left" episodes={[]} />);
    expect(screen.getByText(/Character #1 — Only Episodes/)).toBeInTheDocument();

    rerender(<EpisodeColumn variant="center" episodes={[]} />);
    expect(screen.getByText(/Characters #1 & #2 — Shared Episodes/)).toBeInTheDocument();

    rerender(<EpisodeColumn variant="right" episodes={[]} />);
    expect(screen.getByText(/Character #2 — Only Episodes/)).toBeInTheDocument();
  });

  it("shows empty message when no episodes", () => {
    render(<EpisodeColumn variant="left" episodes={[]} />);

    expect(screen.getByText("No episodes")).toBeInTheDocument();
  });

  it("renders episode items", () => {
    render(<EpisodeColumn variant="left" episodes={mockEpisodes} />);

    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("Dec 2, 2013")).toBeInTheDocument();
  });

  it("calls onEpisodeClick when an episode is clicked", async () => {
    const onEpisodeClick = jest.fn();
    render(<EpisodeColumn variant="left" episodes={mockEpisodes} onEpisodeClick={onEpisodeClick} />);

    await userEvent.click(screen.getByText("Pilot"));
    expect(onEpisodeClick).toHaveBeenCalledWith(mockEpisodes[0]);
  });

  it("applies shared class to center variant", () => {
    const { container } = render(<EpisodeColumn variant="center" episodes={[]} />);

    expect(container.querySelector(".episode-col.shared")).toBeInTheDocument();
  });
});
