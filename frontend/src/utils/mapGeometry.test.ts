import { describe, it, expect } from "vitest";
import {
    isValidCoordinate,
    extractWaypoints,
    buildRoutePath,
    computeBounds,
    DEFAULT_CENTER,
} from "./mapGeometry";

import type { Activity, ItineraryDay } from "@/types/itinerary";

function makeActivity(
    name: string,
    lat: number,
    lng: number,
    time = "10:00"
): Activity {
    return {
        activity: name,
        details: "Details",
        location: {
            name: "Place",
            address: "Address",
            coordinates: { latitude: lat, longitude: lng },
        },
        time,
        duration: "1h",
    };
}

function makeDays(
    ...specs: { day: number; activities: Activity[] }[]
): ItineraryDay[] {
    return specs;
}

describe("mapGeometry", () => {
    describe("isValidCoordinate", () => {
        it("accepts valid coordinates", () => {
            expect(isValidCoordinate(40.4168, -3.7038)).toBe(true);
            expect(isValidCoordinate(0, 0)).toBe(true);
            expect(isValidCoordinate(-90, -180)).toBe(true);
            expect(isValidCoordinate(90, 180)).toBe(true);
        });

        it("rejects out-of-range latitude", () => {
            expect(isValidCoordinate(91, 0)).toBe(false);
            expect(isValidCoordinate(-91, 0)).toBe(false);
        });

        it("rejects out-of-range longitude", () => {
            expect(isValidCoordinate(0, 181)).toBe(false);
            expect(isValidCoordinate(0, -181)).toBe(false);
        });

        it("rejects non-numeric values", () => {
            expect(isValidCoordinate(null, 0)).toBe(false);
            expect(isValidCoordinate(0, undefined)).toBe(false);
            expect(isValidCoordinate("40", "3")).toBe(false);
            expect(isValidCoordinate(NaN, 0)).toBe(false);
            expect(isValidCoordinate(0, Infinity)).toBe(false);
        });
    });

    describe("extractWaypoints", () => {
        it("extracts waypoints from valid activities", () => {
            const days = makeDays({
                day: 1,
                activities: [
                    makeActivity("A", 40.0, -3.0, "09:00"),
                    makeActivity("B", 41.0, -2.0, "14:00"),
                ],
            });
            const wps = extractWaypoints(days);
            expect(wps).toHaveLength(2);
            expect(wps[0].position).toEqual([40.0, -3.0]);
            expect(wps[1].position).toEqual([41.0, -2.0]);
            expect(wps[0].dayNumber).toBe(1);
        });

        it("skips activities with invalid coordinates", () => {
            const days = makeDays({
                day: 1,
                activities: [
                    makeActivity("A", 40.0, -3.0),
                    makeActivity("B", NaN, -2.0),
                    makeActivity("C", 42.0, 200),
                ],
            });
            const wps = extractWaypoints(days);
            expect(wps).toHaveLength(1);
            expect(wps[0].activity.activity).toBe("A");
        });

        it("returns empty array for no valid coordinates", () => {
            const days = makeDays({
                day: 1,
                activities: [makeActivity("A", NaN, NaN)],
            });
            expect(extractWaypoints(days)).toHaveLength(0);
        });

        it("sorts activities by time within a day", () => {
            const days = makeDays({
                day: 1,
                activities: [
                    makeActivity("B", 41.0, -2.0, "14:00"),
                    makeActivity("A", 40.0, -3.0, "09:00"),
                ],
            });
            const wps = extractWaypoints(days);
            expect(wps[0].activity.activity).toBe("A");
            expect(wps[1].activity.activity).toBe("B");
        });

        it("handles multi-day itineraries", () => {
            const days = makeDays(
                { day: 1, activities: [makeActivity("A", 40.0, -3.0)] },
                { day: 2, activities: [makeActivity("B", 41.0, -2.0)] }
            );
            const wps = extractWaypoints(days);
            expect(wps).toHaveLength(2);
            expect(wps[0].dayNumber).toBe(1);
            expect(wps[1].dayNumber).toBe(2);
        });
    });

    describe("buildRoutePath", () => {
        it("returns positions in order", () => {
            const days = makeDays({
                day: 1,
                activities: [
                    makeActivity("A", 40.0, -3.0),
                    makeActivity("B", 41.0, -2.0),
                ],
            });
            const wps = extractWaypoints(days);
            const path = buildRoutePath(wps);
            expect(path).toEqual([
                [40.0, -3.0],
                [41.0, -2.0],
            ]);
        });

        it("returns empty array for no waypoints", () => {
            expect(buildRoutePath([])).toEqual([]);
        });
    });

    describe("computeBounds", () => {
        it("returns correct bounds for multiple points", () => {
            const days = makeDays({
                day: 1,
                activities: [
                    makeActivity("A", 38.0, -5.0),
                    makeActivity("B", 42.0, -1.0),
                ],
            });
            const wps = extractWaypoints(days);
            const bounds = computeBounds(wps);
            expect(bounds).toEqual([
                [38.0, -5.0],
                [42.0, -1.0],
            ]);
        });

        it("returns correct bounds for single point", () => {
            const days = makeDays({
                day: 1,
                activities: [makeActivity("A", 40.0, -3.0)],
            });
            const wps = extractWaypoints(days);
            const bounds = computeBounds(wps);
            expect(bounds).toEqual([
                [40.0, -3.0],
                [40.0, -3.0],
            ]);
        });

        it("returns null for no waypoints", () => {
            expect(computeBounds([])).toBeNull();
        });
    });

    describe("constants", () => {
        it("DEFAULT_CENTER is a valid coordinate", () => {
            expect(isValidCoordinate(DEFAULT_CENTER[0], DEFAULT_CENTER[1])).toBe(true);
        });
    });
});
