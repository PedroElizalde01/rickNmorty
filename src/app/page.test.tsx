import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the episode compare heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /episode compare/i }),
    ).toBeInTheDocument();
  });
});
