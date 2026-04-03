import Features from "@components/sections/Features";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect } from "vitest";

describe("Features", () => {
  it("renders section title correctly", () => {
    render(<Features />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("¿Por qué TripFlow?");
    expect(heading.querySelector("strong")).toHaveTextContent("TripFlow");
  });

  it("renders all feature cards", () => {
    render(<Features />);

    // Check that all 3 features are rendered
    expect(screen.getByText("Itinerarios con IA")).toBeInTheDocument();
    expect(screen.getByText("Acceso sin conexión")).toBeInTheDocument();
    expect(screen.getByText("Rutas claras y eficientes")).toBeInTheDocument();
  });

  it("renders feature descriptions correctly", () => {
    render(<Features />);

    expect(
      screen.getByText(
        "TripFlow genera automáticamente planes de viaje personalizados basados en tus gustos, intereses y duración del viaje, para que disfrutes al máximo sin preocupaciones."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Consulta tu itinerario en cualquier momento, incluso sin conexión a internet, para que siempre tengas tu plan de viaje a mano."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Visualiza y organiza mejor tus paradas para reducir desvíos y mantener cada día del viaje bajo control."
      )
    ).toBeInTheDocument();
  });

  it("renders feature titles as h3 headings", () => {
    render(<Features />);

    const featureTitles = screen.getAllByRole("heading", { level: 3 });
    expect(featureTitles).toHaveLength(3);
    expect(featureTitles[0]).toHaveTextContent("Itinerarios con IA");
    expect(featureTitles[1]).toHaveTextContent("Acceso sin conexión");
    expect(featureTitles[2]).toHaveTextContent("Rutas claras y eficientes");
  });

  it("has correct CSS structure", () => {
    const { container } = render(<Features />);

    const featuresContainer = container.querySelector("div");
    expect(featuresContainer?.className).toMatch(/featuresContainer/);

    const featureCards = container.querySelectorAll(
      "div[class*='featureCard']"
    );
    expect(featureCards).toHaveLength(3);

    const icons = container.querySelectorAll("svg[class*='icon']");
    expect(icons).toHaveLength(3);

    const featureTitles = container.querySelectorAll(
      "h3[class*='featureTitle']"
    );
    expect(featureTitles).toHaveLength(3);

    const featureDescriptions = container.querySelectorAll(
      "p[class*='featureDescription']"
    );
    expect(featureDescriptions).toHaveLength(3);
  });
});
