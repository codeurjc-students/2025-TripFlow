import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import type { ExtendedItinerary } from "@/types/itinerary";
import type { MapWaypoint } from "@/utils/mapGeometry";

import ItineraryMapPage from "@/pages/itineraries/ItineraryMap";

const moveEndHandlers: Array<() => void> = [];

const fakeMap = {
    getZoom: vi.fn(() => 12),
    getSize: vi.fn(() => ({ x: 500, y: 800 })),
    project: vi.fn(() => ({
        add: (offset: [number, number]) => ({ x: 100 + offset[0], y: 200 + offset[1] }),
    })),
    unproject: vi.fn(() => ({ lat: 10, lng: 20 })),
    flyTo: vi.fn(),
    flyToBounds: vi.fn(),
    once: vi.fn((event: string, handler: () => void) => {
        if (event === "moveend") moveEndHandlers.push(handler);
    }),
    on: vi.fn(),
    off: vi.fn(),
    closePopup: vi.fn(),
};

const itineraryMock: ExtendedItinerary = {
    id: 1,
    title: "Itinerario",
    place: "Madrid",
    people: 2,
    budget: 1000,
    date: "2026-06-01",
    status: "PLANNED",
    countDays: 2,
    tags: [],
    coverImage: { altDescription: "", imageUrl: "", authorUsername: "" },
    permissions: { view: true, edit: true, delete: false },
    days: [
        { day: 1, activities: [] },
        { day: 2, activities: [] },
    ],
};

const waypoints: MapWaypoint[] = [
    {
        dayNumber: 1,
        activityIndex: 0,
        position: [40, -3],
        activity: {
            activity: "Museo",
            details: "",
            location: {
                name: "Madrid",
                address: "Calle 1",
                coordinates: { latitude: 40, longitude: -3 },
            },
            time: "09:00",
            duration: "1h",
        },
    },
    {
        dayNumber: 2,
        activityIndex: 0,
        position: [41, -2],
        activity: {
            activity: "Parque",
            details: "",
            location: {
                name: "Madrid",
                address: "Calle 2",
                coordinates: { latitude: 41, longitude: -2 },
            },
            time: "10:00",
            duration: "2h",
        },
    },
];

vi.mock("@/services/itineraryService", () => ({
    getItineraryById: vi.fn(() => Promise.resolve(itineraryMock)),
}));

vi.mock("@/hooks/useItineraryMapData", async () => {
    const React = await import("react");

    return {
        useItineraryMapData: () => {
            const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
            const [selectedWaypointIndex, setSelectedWaypointIndex] = React.useState<number | null>(null);

            const filteredWaypoints = selectedDay === null
                ? waypoints
                : waypoints.filter((wp) => wp.dayNumber === selectedDay);

            return {
                allWaypoints: waypoints,
                filteredWaypoints,
                routePath: filteredWaypoints.map((wp) => wp.position),
                bounds: [[40, -3], [41, -2]],
                dayNumbers: [1, 2],
                selectedDay,
                setSelectedDay,
                selectedWaypointIndex,
                selectWaypoint: setSelectedWaypointIndex,
                hasCoordinates: true,
                invalidCount: 0,
            };
        },
    };
});

vi.mock("@/components/map/LeafletMapView", async () => {
    const React = await import("react");

    return {
        default: ({ onMapReady, children, className }: any) => {
            React.useEffect(() => {
                onMapReady?.(fakeMap);
            }, [onMapReady]);

            return (
                <div data-testid="leaflet-map" className={className}>
                    {children ? children(fakeMap) : null}
                </div>
            );
        },
        useRecenter: () => vi.fn(),
    };
});

const routeLayerProps: Array<{ isHidden?: boolean }> = [];

vi.mock("@/components/map/ItineraryMarkersLayer", () => ({
    default: () => null,
}));

vi.mock("@/components/map/ItineraryRouteLayer", () => ({
    default: (props: { isHidden?: boolean }) => {
        routeLayerProps.push({ isHidden: props.isHidden });
        return null;
    },
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<any>("react-router");

    return {
        ...actual,
        useParams: () => ({ id: "1" }),
        Navigate: ({ to }: { to: string }) => <div>Redirect:{to}</div>,
    };
});

describe("ItineraryMapPage", () => {
    beforeEach(() => {
        routeLayerProps.length = 0;
        moveEndHandlers.length = 0;
        vi.clearAllMocks();
    });

    it("loads itinerary and renders bottom sheet", async () => {
        render(
            <MemoryRouter>
                <ItineraryMapPage />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Itinerario")).toBeInTheDocument());
    });

    it("flyTo on card selection with offset", async () => {
        render(
            <MemoryRouter>
                <ItineraryMapPage />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText("Itinerario")).toBeInTheDocument());

        fireEvent.click(screen.getByRole("button", { name: /Museo - Madrid/ }));

        expect(fakeMap.flyTo).toHaveBeenCalledWith(
            { lat: 10, lng: 20 },
            12,
            expect.objectContaining({ duration: 0.45 })
        );

        expect(routeLayerProps.at(-1)?.isHidden).toBe(true);

        moveEndHandlers.forEach((handler) => handler());
        await waitFor(() => expect(routeLayerProps.at(-1)?.isHidden).toBe(false));
    });

    it("flyToBounds when changing day", async () => {
        render(
            <MemoryRouter>
                <ItineraryMapPage />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText("Itinerario")).toBeInTheDocument());

        fireEvent.click(screen.getByRole("tab", { name: "Filtrar día 2" }));

        await waitFor(() =>
            expect(fakeMap.flyToBounds).toHaveBeenCalledWith(
                [[40, -3], [41, -2]],
                expect.objectContaining({ duration: 0.6 })
            )
        );
    });
});
