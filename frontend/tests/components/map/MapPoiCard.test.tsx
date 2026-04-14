import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MapSuggestion } from "@/types/map";
import MapPoiCard from "@/components/map/MapPoiCard";

function makePlace(overrides: Partial<MapSuggestion> = {}): MapSuggestion {
    return {
        id: "place-1",
        name: "Museo",
        fullAddress: "Calle Mayor 1",
        placeFormatted: "Madrid",
        featureType: "poi",
        center: { latitude: 40.4, longitude: -3.7 },
        categories: ["museum", "poi"],
        ...overrides,
    };
}

describe("MapPoiCard", () => {
    it("renders place info and triggers click", () => {
        const onClick = vi.fn();

        render(
            <MapPoiCard
                place={makePlace()}
                isSelected={false}
                onClick={onClick}
                distanceKm={2.35}
            />
        );

        const button = screen.getByRole("button", { name: /Museo - Calle Mayor 1/ });
        expect(screen.getByText("Lugar")).toBeInTheDocument();
        expect(screen.getByText(/2.4 km/)).toBeInTheDocument();

        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });

    it("handles null-like place fields with safe fallbacks", () => {
        const onClick = vi.fn();

        render(
            <MapPoiCard
                place={makePlace({
                    name: null as unknown as string,
                    fullAddress: null as unknown as string,
                    placeFormatted: null as unknown as string,
                    featureType: null as unknown as string,
                    categories: [null as unknown as string, "poi"],
                })}
                isSelected={true}
                onClick={onClick}
                distanceKm={null}
            />
        );

        const button = screen.getByRole("button", { name: /^Lugar$/ });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });
});
