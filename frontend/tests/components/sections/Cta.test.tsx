import Cta from "@components/sections/Cta";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect } from "vitest";

describe("Cta", () => {
  it("renders section title correctly", () => {
    render(<Cta />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("renders content paragraphs", () => {
    const { container } = render(<Cta />);

    const paragraphs = container.querySelectorAll("p[class*='ctaText']");
    expect(paragraphs).toHaveLength(1);

    paragraphs.forEach((paragraph) => {
      expect(paragraph.textContent).toBeTruthy();
    });
  });

  it("renders DemoButton component", () => {
    render(<Cta />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("DemoButton shows correct initial text", () => {
    render(<Cta />);

    const button = screen.getByRole("button", { name: /probar demo/i });
    expect(button).toBeInTheDocument();
  });

  it("has correct CSS structure", () => {
    const { container } = render(<Cta />);

    const ctaSurface = container.querySelector("div[class*='ctaSurface']");
    expect(ctaSurface).toBeInTheDocument();

    const ctaContent = container.querySelector("div[class*='ctaContent']");
    expect(ctaContent).toBeInTheDocument();

    const ctaTexts = container.querySelectorAll("p[class*='ctaText']");
    expect(ctaTexts).toHaveLength(1);

    const actions = container.querySelector("div[class*='actions']");
    expect(actions).toBeInTheDocument();
  });

  it("DemoButton has primary style", () => {
    const { container } = render(<Cta />);

    const button = container.querySelector("button[class*='primary']");
    expect(button).toBeInTheDocument();
  });

  it("has proper content structure", () => {
    const { container } = render(<Cta />);

    const ctaContent = container.querySelector("div[class*='ctaContent']");
    const lead = ctaContent?.querySelector("p[class*='ctaLead']");
    const paragraphs = ctaContent?.querySelectorAll("p[class*='ctaText']");
    const actionsDiv = ctaContent?.querySelector("div[class*='actions']");
    const button = actionsDiv?.querySelector("button");

    expect(lead).toBeInTheDocument();
    expect(paragraphs).toHaveLength(1);
    expect(actionsDiv).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("renders all expected text content", () => {
    const { container } = render(<Cta />);

    expect(container.textContent).toContain("Empieza a planificar un viaje");
    expect(container.textContent).toContain("Diseña tu itinerario en minutos");
    expect(container.textContent).toContain("Prueba la demo y empieza a planificar hoy.");
  });
});
