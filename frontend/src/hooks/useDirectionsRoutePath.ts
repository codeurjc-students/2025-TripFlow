import { useEffect, useMemo, useState } from "react";

import type { MapDirectionsProfile } from "@/types/map";
import { getDirections } from "@/services/mapsService";
import {
    buildDirectionsCacheKey,
    getCachedDirectionsPath,
    setCachedDirectionsPath,
} from "@/services/mapDirectionsCache";
import { isValidCoordinate, type MapWaypoint } from "@/utils/mapGeometry";

import type { LatLngTuple } from "leaflet";

const DEFAULT_PROFILE: MapDirectionsProfile = "DRIVING";
const MAX_DIRECTIONS_WAYPOINTS = 25;

export interface UseDirectionsRoutePathResult {
    routePath: LatLngTuple[];
    isRouteLoading: boolean;
}

export const DEFAULT_DIRECTIONS_PROFILE = DEFAULT_PROFILE;

function toBasePath(waypoints: MapWaypoint[]): LatLngTuple[] {
    return waypoints.map((wp) => wp.position);
}

function extractRoutePathFromResponse(response: Awaited<ReturnType<typeof getDirections>>): LatLngTuple[] {
    const route = response.routes[0];
    if (!route || !Array.isArray(route.geometry)) {
        return [];
    }

    return route.geometry
        .map((point): LatLngTuple | null => {
            if (!isValidCoordinate(point.latitude, point.longitude)) {
                return null;
            }
            return [point.latitude, point.longitude];
        })
        .filter((value): value is LatLngTuple => value !== null);
}

export function useDirectionsRoutePath(
    waypoints: MapWaypoint[],
    profile: MapDirectionsProfile = DEFAULT_PROFILE
): UseDirectionsRoutePathResult {
    const [routePath, setRoutePath] = useState<LatLngTuple[]>([]);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    const basePath = useMemo(() => toBasePath(waypoints), [waypoints]);

    const cacheKey = useMemo(() => buildDirectionsCacheKey({
        profile,
        waypoints: basePath,
        alternatives: false,
        steps: false,
    }), [profile, basePath]);

    useEffect(() => {
        let isMounted = true;

        if (basePath.length < 2) {
            setRoutePath(basePath);
            setIsRouteLoading(false);
            return;
        }

        if (basePath.length > MAX_DIRECTIONS_WAYPOINTS) {
            setRoutePath(basePath);
            setIsRouteLoading(false);
            return;
        }

        const cachedPath = getCachedDirectionsPath(cacheKey);
        if (cachedPath) {
            setRoutePath(cachedPath);
            setIsRouteLoading(false);
            return;
        }

        setRoutePath(basePath);
        setIsRouteLoading(true);

        void getDirections({
            profile,
            waypoints: basePath.map(([latitude, longitude]) => ({ latitude, longitude })),
            alternatives: false,
            steps: false,
        })
            .then((response) => {
                if (!isMounted) return;

                const directionsPath = extractRoutePathFromResponse(response);
                if (directionsPath.length >= 2) {
                    setCachedDirectionsPath(cacheKey, directionsPath);
                    setRoutePath(directionsPath);
                    return;
                }

                setRoutePath(basePath);
            })
            .catch(() => {
                if (!isMounted) return;
                setRoutePath(basePath);
            })
            .finally(() => {
                if (!isMounted) return;
                setIsRouteLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [profile, cacheKey, basePath]);

    return {
        routePath,
        isRouteLoading,
    };
}
