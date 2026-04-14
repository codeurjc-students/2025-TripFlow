import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ExtendedItinerary } from "@/types/itinerary";
import { useDirectionsRoutePath } from "@/hooks/useDirectionsRoutePath";
import { extractWaypoints } from "@/utils/mapGeometry";
import { offlineCacheService } from "@/services/offlineCacheService";

const getDirectionsMock = vi.fn();

vi.mock("@/services/mapsService", () => ({
    getDirections: (...args: unknown[]) => getDirectionsMock(...args),
}));

function makeWaypointsFromItinerary(
    days: { day: number; activities: { lat: number; lng: number; time?: string; name?: string }[] }[]
) {
    const itinerary: ExtendedItinerary = {
        id: 1,
        title: "Trip",
        place: "Spain",
        people: 2,
        budget: 1000,
        date: "2026-06-01",
        status: "PLANNED",
        countDays: days.length,
        tags: [],
        coverImage: { altDescription: "", imageUrl: "", authorUsername: "" },
        permissions: { view: true, edit: true, delete: false },
        days: days.map((d) => ({
            day: d.day,
            activities: d.activities.map((a) => ({
                activity: a.name || "Activity",
                details: "Details",
                location: {
                    name: "Place",
                    address: "Address",
                    coordinates: { latitude: a.lat, longitude: a.lng },
                },
                time: a.time || "10:00",
                duration: "1h",
            })),
        })),
    };

    return extractWaypoints(itinerary.days);
}

describe("useDirectionsRoutePath", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        offlineCacheService.clearMemory();
    });

    it("returns base path without calling directions when fewer than 2 waypoints", () => {
        const waypoints = makeWaypointsFromItinerary([
            { day: 1, activities: [{ lat: 40.4, lng: -3.7 }] },
        ]);

        const { result } = renderHook(() => useDirectionsRoutePath(waypoints));

        expect(result.current.routePath).toEqual([[40.4, -3.7]]);
        expect(getDirectionsMock).not.toHaveBeenCalled();
    });

    it("uses cached geometry when available", () => {
        const waypoints = makeWaypointsFromItinerary([
            {
                day: 1,
                activities: [
                    { lat: 40.4, lng: -3.7 },
                    { lat: 41.0, lng: -2.0 },
                ],
            },
        ]);
        const cacheKey = "maps-directions:v1|profile:DRIVING|alternatives:false|steps:false|waypoints:40.400000,-3.700000;41.000000,-2.000000";
        const cachedPath: [number, number][] = [
            [40.4, -3.7],
            [40.8, -2.9],
            [41.0, -2.0],
        ];

        offlineCacheService.set(cacheKey, cachedPath, 60_000);

        const { result } = renderHook(() => useDirectionsRoutePath(waypoints));

        expect(result.current.routePath).toEqual(cachedPath);
        expect(getDirectionsMock).not.toHaveBeenCalled();
    });

    it("fetches and stores geometry when cache is missing", async () => {
        const waypoints = makeWaypointsFromItinerary([
            {
                day: 1,
                activities: [
                    { lat: 40.4, lng: -3.7 },
                    { lat: 41.0, lng: -2.0 },
                ],
            },
        ]);

        getDirectionsMock.mockResolvedValue({
            routes: [
                {
                    distance: 1200,
                    duration: 780,
                    geometry: [
                        { latitude: 40.4, longitude: -3.7 },
                        { latitude: 40.8, longitude: -2.9 },
                        { latitude: 41.0, longitude: -2.0 },
                    ],
                    legs: [],
                },
            ],
        });

        const { result } = renderHook(() => useDirectionsRoutePath(waypoints));

        await waitFor(() => {
            expect(result.current.isRouteLoading).toBe(false);
            expect(result.current.routePath).toEqual([
                [40.4, -3.7],
                [40.8, -2.9],
                [41.0, -2.0],
            ]);
        });

        expect(getDirectionsMock).toHaveBeenCalledOnce();
    });

    it("falls back to base path when directions request fails", async () => {
        const waypoints = makeWaypointsFromItinerary([
            {
                day: 1,
                activities: [
                    { lat: 40.4, lng: -3.7 },
                    { lat: 41.0, lng: -2.0 },
                ],
            },
        ]);

        getDirectionsMock.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useDirectionsRoutePath(waypoints));

        await waitFor(() => {
            expect(result.current.isRouteLoading).toBe(false);
            expect(result.current.routePath).toEqual([
                [40.4, -3.7],
                [41.0, -2.0],
            ]);
        });
    });
});
