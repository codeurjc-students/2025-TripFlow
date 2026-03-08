import ItineraryCard from "@components/dashboard/itineraries/ItineraryCard";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";

import type { Itinerary } from "@/types/itinerary";

// Mock AttributionImage to simplify test
vi.mock("@/components/shared/AttributionImage", () => ({
    default: ({ children, src, alt }: any) => (
        <div data-testid="attribution-image" data-src={src} data-alt={alt}>
            {children}
        </div>
    ),
}));

describe("ItineraryCard Component", () => {
    const mockItinerary: Itinerary = {
        id: 1,
        title: "Viaje a París",
        place: "París, Francia",
        people: 2,
        budget: 2000,
        date: "2024-06-01",
        status: "DRAFT",
        countDays: 7,
        tags: ["romántica", "cultural"],
        coverImage: {
            altDescription: "Una hermosa vista de la Torre Eiffel",
            imageUrl: "https://example.com/eiffel-tower.jpg",
            authorUsername: "photographer789",
        },
        permissions: { view: true, edit: true, delete: true }
    };

    it("renders itinerary information", () => {
        render(<ItineraryCard itinerary={mockItinerary} />);

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/itineraries/1"
        );
        expect(screen.getByText(/Viaje a París/)).toBeInTheDocument();
        expect(screen.getByText(/París, Francia/)).toBeInTheDocument();
    });

    it("renders cover image with correct props", () => {
        render(<ItineraryCard itinerary={mockItinerary} />);
        const imageContainer = screen.getByTestId("attribution-image");
        expect(imageContainer).toHaveAttribute("data-src", "https://example.com/eiffel-tower.jpg");
        expect(imageContainer).toHaveAttribute("data-alt", "Una hermosa vista de la Torre Eiffel");
    });
});
