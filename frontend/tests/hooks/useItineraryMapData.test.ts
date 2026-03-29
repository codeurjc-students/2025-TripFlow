import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useItineraryMapData } from "@/hooks/useItineraryMapData";
import type { ExtendedItinerary } from "@/types/itinerary";

function makeItinerary(
    days: { day: number; activities: { lat: number; lng: number; time?: string; name?: string }[] }[]
): ExtendedItinerary {
    return {
        id: 1,
        title: "Test Trip",
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
}

describe("useItineraryMapData", () => {
    it("returns empty data for null itinerary", () => {
        const { result } = renderHook(() => useItineraryMapData(null));
        expect(result.current.allWaypoints).toHaveLength(0);
        expect(result.current.filteredWaypoints).toHaveLength(0);
        expect(result.current.hasCoordinates).toBe(false);
        expect(result.current.bounds).toBeNull();
    });

    it("extracts waypoints from valid itinerary", () => {
        const itin = makeItinerary([
            { day: 1, activities: [{ lat: 40, lng: -3 }, { lat: 41, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        expect(result.current.allWaypoints).toHaveLength(2);
        expect(result.current.filteredWaypoints).toHaveLength(2);
        expect(result.current.hasCoordinates).toBe(true);
        expect(result.current.routePath).toHaveLength(2);
        expect(result.current.bounds).not.toBeNull();
        expect(result.current.dayNumbers).toEqual([1]);
    });

    it("computes invalidCount for activities with bad coordinates", () => {
        const itin = makeItinerary([
            { day: 1, activities: [{ lat: 40, lng: -3 }, { lat: NaN, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        expect(result.current.allWaypoints).toHaveLength(1);
        expect(result.current.invalidCount).toBe(1);
    });

    it("filters waypoints by selected day", () => {
        const itin = makeItinerary([
            { day: 1, activities: [{ lat: 40, lng: -3 }] },
            { day: 2, activities: [{ lat: 41, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        expect(result.current.filteredWaypoints).toHaveLength(2);

        act(() => {
            result.current.setSelectedDay(1);
        });

        expect(result.current.selectedDay).toBe(1);
        expect(result.current.filteredWaypoints).toHaveLength(1);
        expect(result.current.filteredWaypoints[0].dayNumber).toBe(1);
    });

    it("resets waypoint selection on day change", () => {
        const itin = makeItinerary([
            { day: 1, activities: [{ lat: 40, lng: -3 }] },
            { day: 2, activities: [{ lat: 41, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        act(() => {
            result.current.selectWaypoint(0);
        });
        expect(result.current.selectedWaypointIndex).toBe(0);

        act(() => {
            result.current.setSelectedDay(2);
        });
        expect(result.current.selectedWaypointIndex).toBeNull();
    });

    it("returns all waypoints when day filter is set back to null", () => {
        const itin = makeItinerary([
            { day: 1, activities: [{ lat: 40, lng: -3 }] },
            { day: 2, activities: [{ lat: 41, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        act(() => {
            result.current.setSelectedDay(1);
        });
        expect(result.current.filteredWaypoints).toHaveLength(1);

        act(() => {
            result.current.setSelectedDay(null);
        });
        expect(result.current.filteredWaypoints).toHaveLength(2);
    });

    it("handles itinerary with no activities", () => {
        const itin = makeItinerary([{ day: 1, activities: [] }]);
        const { result } = renderHook(() => useItineraryMapData(itin));

        expect(result.current.allWaypoints).toHaveLength(0);
        expect(result.current.hasCoordinates).toBe(false);
        expect(result.current.invalidCount).toBe(0);
    });

    it("provides multiple day numbers sorted", () => {
        const itin = makeItinerary([
            { day: 3, activities: [{ lat: 42, lng: -1 }] },
            { day: 1, activities: [{ lat: 40, lng: -3 }] },
            { day: 2, activities: [{ lat: 41, lng: -2 }] },
        ]);
        const { result } = renderHook(() => useItineraryMapData(itin));
        expect(result.current.dayNumbers).toEqual([1, 2, 3]);
    });
});
