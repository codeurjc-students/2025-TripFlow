import { useMemo, useState, useCallback } from "react";

import type { ExtendedItinerary } from "@/types/itinerary";
import {
    extractWaypoints,
    buildRoutePath,
    computeBounds,
    type MapWaypoint,
} from "@/utils/mapGeometry";

import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

export interface ItineraryMapData {
    allWaypoints: MapWaypoint[];
    filteredWaypoints: MapWaypoint[];
    routePath: LatLngTuple[];
    bounds: LatLngBoundsExpression | null;
    dayNumbers: number[];
    selectedDay: number | null;
    setSelectedDay: (day: number | null) => void;
    selectedWaypointIndex: number | null;
    selectWaypoint: (index: number | null) => void;
    hasCoordinates: boolean;
    invalidCount: number;
}

export function useItineraryMapData(
    itinerary: ExtendedItinerary | null
): ItineraryMapData {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);

    const allWaypoints = useMemo(() => {
        if (!itinerary) return [];
        return extractWaypoints(itinerary.days);
    }, [itinerary]);

    const dayNumbers = useMemo(() => {
        if (!itinerary) return [];
        return itinerary.days.map((d) => d.day).sort((a, b) => a - b);
    }, [itinerary]);

    const totalActivities = useMemo(() => {
        if (!itinerary) return 0;
        return itinerary.days.reduce((sum, d) => sum + d.activities.length, 0);
    }, [itinerary]);

    const filteredWaypoints = useMemo(() => {
        if (selectedDay === null) return allWaypoints;
        return allWaypoints.filter((wp) => wp.dayNumber === selectedDay);
    }, [allWaypoints, selectedDay]);

    const routePath = useMemo(
        () => buildRoutePath(filteredWaypoints),
        [filteredWaypoints]
    );

    const bounds = useMemo(
        () => computeBounds(filteredWaypoints),
        [filteredWaypoints]
    );

    const handleSetSelectedDay = useCallback((day: number | null) => {
        setSelectedDay(day);
        setSelectedWaypointIndex(null);
    }, []);

    return {
        allWaypoints,
        filteredWaypoints,
        routePath,
        bounds,
        dayNumbers,
        selectedDay,
        setSelectedDay: handleSetSelectedDay,
        selectedWaypointIndex,
        selectWaypoint: setSelectedWaypointIndex,
        hasCoordinates: allWaypoints.length > 0,
        invalidCount: totalActivities - allWaypoints.length,
    };
}
