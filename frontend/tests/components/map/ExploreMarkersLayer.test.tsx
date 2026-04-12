import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MapSuggestion } from "@/types/map";
import ExploreMarkersLayer from "@/components/map/ExploreMarkersLayer";

const leafletMocks = vi.hoisted(() => {
    const bindPopup = vi.fn();
    const on = vi.fn();
    const setZIndexOffset = vi.fn();
    const remove = vi.fn();
    const getPopup = vi.fn(() => ({ getElement: () => null }));

    const markerMock = vi.fn(() => ({
        addTo: () => ({
            bindPopup: (html: string) => {
                bindPopup(html);
                return { on, setZIndexOffset, remove, getPopup };
            },
        }),
    }));

    return { bindPopup, on, setZIndexOffset, remove, markerMock, getPopup };
});

vi.mock("@styles/components/shared/Button.module.css", () => ({
    default: {
        button: "button",
        small: "small",
        primary: "primary",
        secondary: "secondary",
    },
}));

vi.mock("leaflet", () => ({
    default: {
        divIcon: vi.fn(() => ({})),
        marker: leafletMocks.markerMock,
    },
}));

function makePlace(overrides: Partial<MapSuggestion> = {}): MapSuggestion {
    return {
        id: "place-1",
        name: "<b>Museo</b>",
        fullAddress: "<i>Calle 1</i>",
        placeFormatted: "Madrid",
        featureType: "poi",
        center: { latitude: 40.4, longitude: -3.7 },
        categories: ["museum"],
        ...overrides,
    };
}

describe("ExploreMarkersLayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("escapes popup content and handles null-like fields", () => {
        const map = {} as any;

        expect(() => {
            render(
                <ExploreMarkersLayer
                    map={map}
                    places={[
                        makePlace({
                            name: null as unknown as string,
                            fullAddress: null as unknown as string,
                            placeFormatted: null as unknown as string,
                        }),
                    ]}
                    selectedIndex={null}
                    onSelect={vi.fn()}
                    onAddToTrip={vi.fn()}
                    onNavigate={vi.fn()}
                    userCoords={null}
                />
            );
        }).not.toThrow();

        const html = leafletMocks.bindPopup.mock.calls[0][0];
        expect(html).toContain("Lugar");
        expect(html).toContain("Sin direccion");
    });
});
