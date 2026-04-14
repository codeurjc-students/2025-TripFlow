import type { LatLngTuple } from "leaflet";

import type { MapDirectionsProfile } from "@/types/map";
import { offlineCacheService } from "@/services/offlineCacheService";
import { isValidCoordinate } from "@/utils/mapGeometry";

const DIRECTIONS_CACHE_VERSION = "maps-directions:v1";
const DIRECTIONS_CACHE_TTL_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const KEY_COORDINATE_PRECISION = 6;

export interface DirectionsKeyParams {
    profile: MapDirectionsProfile;
    waypoints: LatLngTuple[];
    alternatives?: boolean;
    steps?: boolean;
}

function normalizeCoordinate(value: number): string {
    return value.toFixed(KEY_COORDINATE_PRECISION);
}

function serializeWaypoint([latitude, longitude]: LatLngTuple): string {
    return `${normalizeCoordinate(latitude)},${normalizeCoordinate(longitude)}`;
}

function isValidPath(path: LatLngTuple[]): boolean {
    return path.length >= 2 && path.every(([lat, lng]) => isValidCoordinate(lat, lng));
}

export function buildDirectionsCacheKey(params: DirectionsKeyParams): string {
    const flags = [
        `profile:${params.profile}`,
        `alternatives:${Boolean(params.alternatives)}`,
        `steps:${Boolean(params.steps)}`,
    ].join("|");
    const serializedWaypoints = params.waypoints.map(serializeWaypoint).join(";");

    return `${DIRECTIONS_CACHE_VERSION}|${flags}|waypoints:${serializedWaypoints}`;
}

export function getCachedDirectionsPath(cacheKey: string): LatLngTuple[] | null {
    const cached = offlineCacheService.get<LatLngTuple[]>(cacheKey);
    if (!cached || !isValidPath(cached.data)) {
        return null;
    }

    return cached.data;
}

export function setCachedDirectionsPath(cacheKey: string, path: LatLngTuple[]): void {
    if (!isValidPath(path)) {
        return;
    }
    offlineCacheService.set(cacheKey, path, DIRECTIONS_CACHE_TTL_MS);
}
