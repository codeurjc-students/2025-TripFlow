import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MapWaypoint } from "@/utils/mapGeometry";
import ItineraryMarkersLayer from "@/components/map/ItineraryMarkersLayer";

const leafletMocks = vi.hoisted(() => {
    const bindPopup = vi.fn();
    const on = vi.fn();
    const setZIndexOffset = vi.fn();
    const openPopup = vi.fn();
    const remove = vi.fn();
    const divIconMock = vi.fn(() => ({}));
    const markerMock = vi.fn(() => ({
        addTo: () => ({
            bindPopup: (html: string) => {
                bindPopup(html);
                return { setZIndexOffset, on, openPopup, remove };
            },
        }),
    }));

    return { bindPopup, on, setZIndexOffset, openPopup, remove, divIconMock, markerMock };
});

vi.mock("leaflet", () => ({
    default: {
        divIcon: leafletMocks.divIconMock,
        marker: leafletMocks.markerMock,
    },
}));

function makeWaypoint(overrides: Partial<MapWaypoint> = {}): MapWaypoint {
    return {
        dayNumber: 1,
        activityIndex: 0,
        position: [40, -3],
        activity: {
            activity: "<script>alert(1)</script>",
            details: "Detalles",
            location: {
                name: "<b>Madrid</b>",
                address: "Calle 1",
                coordinates: { latitude: 40, longitude: -3 },
            },
            time: "10:00",
            duration: "1h",
        },
        ...overrides,
    };
}

describe("ItineraryMarkersLayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("escapes popup content", () => {
        const map = {} as any;

        render(
            <ItineraryMarkersLayer
                map={map}
                waypoints={[makeWaypoint()]}
                selectedIndex={0}
                onMarkerClick={vi.fn()}
            />
        );

        const html = leafletMocks.bindPopup.mock.calls[0][0];
        expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
        expect(html).toContain("&lt;b&gt;Madrid&lt;/b&gt;");
    });

    it("sets z-index on selected marker", () => {
        const map = {} as any;

        render(
            <ItineraryMarkersLayer
                map={map}
                waypoints={[makeWaypoint()]}
                selectedIndex={0}
                onMarkerClick={vi.fn()}
            />
        );

        expect(leafletMocks.setZIndexOffset).toHaveBeenCalledWith(1000);
        expect(leafletMocks.on).toHaveBeenCalled();
    });

    it("handles null-like activity fields without crashing", () => {
        const map = {} as any;

        const waypoint = makeWaypoint();
        const withNulls = {
            ...waypoint,
            activity: {
                ...waypoint.activity,
                activity: null as unknown as string,
                location: {
                    ...waypoint.activity.location,
                    name: null as unknown as string,
                },
                time: null as unknown as string,
            },
        };

        expect(() => {
            render(
                <ItineraryMarkersLayer
                    map={map}
                    waypoints={[withNulls]}
                    selectedIndex={null}
                    onMarkerClick={vi.fn()}
                />
            );
        }).not.toThrow();

        const html = leafletMocks.bindPopup.mock.calls[0][0];
        expect(html).toContain("Actividad");
        expect(html).toContain("Ubicacion");
    });
});
