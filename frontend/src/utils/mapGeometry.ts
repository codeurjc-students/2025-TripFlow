import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { Activity } from "@/types/itinerary";

/**
 * Validates that a coordinate pair has finite numeric latitude and longitude
 * within standard WGS-84 ranges.
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
    if (typeof lat !== "number" || typeof lng !== "number") return false;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export interface MapWaypoint {
    dayNumber: number;
    activityIndex: number;
    position: LatLngTuple;
    activity: Activity;
}

/**
 * Extracts ordered waypoints from activities that have valid coordinates.
 */
export function extractWaypoints(
    days: { day: number; activities: Activity[] }[]
): MapWaypoint[] {
    const waypoints: MapWaypoint[] = [];

    for (const day of days) {
        const sorted = [...day.activities].sort((a, b) =>
            (a.time || "99:99").localeCompare(b.time || "99:99")
        );

        sorted.forEach((activity, index) => {
            const { latitude, longitude } = activity.location.coordinates;
            if (isValidCoordinate(latitude, longitude)) {
                waypoints.push({
                    dayNumber: day.day,
                    activityIndex: index,
                    position: [latitude, longitude],
                    activity,
                });
            }
        });
    }

    return waypoints;
}

/**
 * Generates polyline path from ordered waypoints.
 */
export function buildRoutePath(waypoints: MapWaypoint[]): LatLngTuple[] {
    return waypoints.map((wp) => wp.position);
}

/**
 * Computes Leaflet bounds from a set of waypoints.
 * Returns null if fewer than 1 waypoint.
 */
export function computeBounds(
    waypoints: MapWaypoint[]
): LatLngBoundsExpression | null {
    if (waypoints.length === 0) return null;

    const lats = waypoints.map((wp) => wp.position[0]);
    const lngs = waypoints.map((wp) => wp.position[1]);

    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);

    return [
        [south, west],
        [north, east],
    ];
}

/** Default map center (geographic center of Spain) when no coordinates exist. */
export const DEFAULT_CENTER: LatLngTuple = [40.4168, -3.7038];
export const DEFAULT_ZOOM = 5;
export const FIT_BOUNDS_PADDING: [number, number] = [50, 50];
