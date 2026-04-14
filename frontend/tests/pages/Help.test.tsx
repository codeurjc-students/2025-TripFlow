import HelpPage from "@/pages/Help";
import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect } from "vitest";

describe("HelpPage", () => {
    it("renders FAQ section title", () => {
        render(<HelpPage />);
        expect(screen.getByRole("heading", { level: 2, name: /Preguntas Frecuentes/i })).toBeInTheDocument();
    });

    it("renders FAQ categories", () => {
        render(<HelpPage />);
        expect(screen.getByRole("heading", { level: 3, name: /General/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: /Itinerarios e IA/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: /Cuenta y Privacidad/i })).toBeInTheDocument();
    });

    it("toggles accordion items independently", () => {
        render(<HelpPage />);
        
        const generalBtn = screen.getByRole("button", { name: /¿Es gratuito TripFlow\?/i });
        const itineraryBtn = screen.getByRole("button", { name: /¿Cómo funciona la generación por IA\?/i });

        expect(generalBtn).toHaveAttribute("aria-expanded", "true");

        fireEvent.click(generalBtn);
        expect(generalBtn).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(itineraryBtn);
        expect(itineraryBtn).toHaveAttribute("aria-expanded", "true");
        
        expect(generalBtn).toHaveAttribute("aria-expanded", "false");
    });
});
