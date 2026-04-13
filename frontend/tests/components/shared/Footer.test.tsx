import Footer from "@components/shared/Footer";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect } from "vitest";

describe("Footer Component", () => {
  it("renders footer element", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("displays TripFlow branding and description", () => {
    render(<Footer />);

    expect(screen.getByText("TripFlow")).toBeInTheDocument();
    expect(
      screen.getByText(/planificador de viajes inteligente/i)
    ).toBeInTheDocument();
  });

  it("displays author information", () => {
    render(<Footer />);

    expect(screen.getByText(/Creado por/)).toBeInTheDocument();
    expect(screen.getByText("CuB1z")).toBeInTheDocument();
  });

  it("displays copyright information", () => {
    render(<Footer />);

    const copyright = screen.getByText(/©20\d{2} TripFlow\./);
    expect(copyright).toBeInTheDocument();

    expect(screen.getByText(/Todos los derechos reservados\./)).toBeInTheDocument();
  });

  it("TripFlow link points to home page", () => {
    render(<Footer />);

    const tripflowLink = screen.getByText("TripFlow").closest("a");
    expect(tripflowLink).toHaveAttribute("href", "/");
  });

  it("renders social media links with correct attributes", () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText(/github/i);
    expect(githubLink).toHaveAttribute("href", "https://github.com/CuB1z");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    const linkedinLink = screen.getByLabelText(/linkedin/i);
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/cub1z/"
    );
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has correct CSS structure", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toMatch(/footer/);

    const contentDiv = footer.querySelector("div");
    expect(contentDiv?.className).toMatch(/content/);
  });
});
