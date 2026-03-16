import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CharacterCard } from "./CharacterCard";

describe("CharacterCard", () => {
  const defaultProps = {
    name: "Rick Sanchez",
    status: "Alive" as const,
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  };

  it("renders name, status and species", () => {
    render(<CharacterCard {...defaultProps} />);

    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText(/Alive — Human/)).toBeInTheDocument();
  });

  it("renders the character image", () => {
    render(<CharacterCard {...defaultProps} />);

    const img = screen.getByAltText("Rick Sanchez");
    expect(img).toHaveAttribute("src", defaultProps.image);
  });

  it("does not show selected tag by default", () => {
    render(<CharacterCard {...defaultProps} />);

    expect(screen.queryByText("selected")).not.toBeInTheDocument();
  });

  it("shows selected tag and applies selected class when selected", () => {
    render(<CharacterCard {...defaultProps} selected />);

    expect(screen.getByText("selected")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveClass("selected");
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<CharacterCard {...defaultProps} onClick={onClick} />);

    await userEvent.click(screen.getByRole("article"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
