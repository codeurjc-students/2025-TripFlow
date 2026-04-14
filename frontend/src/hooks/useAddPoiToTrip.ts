import { useCallback, useState } from "react";

import type { MapSuggestion } from "@/types/map";
import type { ExtendedItinerary, Itinerary } from "@/types/itinerary";
import type { PageResponse } from "@/types/shared";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getItineraryById, getUserItineraries, updateItinerary } from "@/services/itineraryService";
import { retrieveFromLocalStorage, saveToLocalStorage } from "@/utils/localStorageUtils";

export interface EditableItineraryOption {
    id: number;
    title: string;
    countDays: number;
}

export interface AddPoiToTripInput {
    poi: MapSuggestion;
    itineraryId: number;
    dayNumber: number;
    time?: string;
    duration?: string;
}

interface UseAddPoiToTripResult {
    isSubmitting: boolean;
    loadEditableItineraries: () => Promise<EditableItineraryOption[]>;
    addPoiToTrip: (input: AddPoiToTripInput) => Promise<void>;
}

function normalizeCountDays(itinerary: Itinerary): number {
    return Math.max(1, itinerary.countDays || 1);
}

function buildActivityFromPoi(poi: MapSuggestion, time?: string, duration?: string) {
    if (!poi.center) {
        throw new Error("POI has no coordinates");
    }

    return {
        activity: poi.name,
        details: "Agregado desde explorar mapa",
        location: {
            name: poi.name,
            address: poi.fullAddress || poi.placeFormatted || "",
            coordinates: {
                latitude: poi.center.latitude,
                longitude: poi.center.longitude,
            },
        },
        time: (time || "").trim(),
        duration: (duration || "").trim(),
    };
}

function mapPageToEditableOptions(page: PageResponse<Itinerary>): EditableItineraryOption[] {
    return page.page
        .filter((itinerary) => itinerary.permissions?.edit)
        .map((itinerary) => ({
            id: itinerary.id,
            title: itinerary.title,
            countDays: normalizeCountDays(itinerary),
        }));
}

export function useAddPoiToTrip(): UseAddPoiToTripResult {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadEditableItineraries = useCallback(async (): Promise<EditableItineraryOption[]> => {
        const firstPage = await getUserItineraries({ page: 0, size: 100 });
        return mapPageToEditableOptions(firstPage);
    }, []);

    const addPoiToTrip = useCallback(async ({ poi, itineraryId, dayNumber, time, duration }: AddPoiToTripInput): Promise<void> => {
        if (!poi.center) {
            throw new Error("POI has no coordinates");
        }

        setIsSubmitting(true);
        try {
            const itinerary = await getItineraryById(itineraryId);
            const safeDay = Math.max(1, dayNumber);

            const nextDays = itinerary.days.map((day) => {
                if (day.day !== safeDay) {
                    return day;
                }

                return {
                    ...day,
                    activities: [
                        ...day.activities,
                        buildActivityFromPoi(poi, time, duration),
                    ],
                };
            });

            const dayExists = nextDays.some((day) => day.day === safeDay);
            const daysWithActivity = dayExists
                ? nextDays
                : [
                    ...nextDays,
                    {
                        day: safeDay,
                        activities: [buildActivityFromPoi(poi, time, duration)],
                    },
                ].sort((a, b) => a.day - b.day);

            const payload: ExtendedItinerary = {
                ...itinerary,
                days: daysWithActivity,
                countDays: Math.max(itinerary.countDays, safeDay),
            };

            await updateItinerary(itineraryId, payload);

            saveToLocalStorage(STORAGE_KEYS.MAP_EXPLORE_LAST_ITINERARY_ID, itineraryId);
            saveToLocalStorage(STORAGE_KEYS.MAP_EXPLORE_LAST_DAY, safeDay);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        isSubmitting,
        loadEditableItineraries,
        addPoiToTrip,
    };
}

export function getPreferredItineraryId(options: EditableItineraryOption[]): number | null {
    if (options.length === 0) {
        return null;
    }

    const persistedId = retrieveFromLocalStorage<number>(STORAGE_KEYS.MAP_EXPLORE_LAST_ITINERARY_ID);
    if (typeof persistedId === "number" && options.some((option) => option.id === persistedId)) {
        return persistedId;
    }

    return options[0].id;
}

export function getPreferredDayNumber(maxDays: number): number {
    const persistedDay = retrieveFromLocalStorage<number>(STORAGE_KEYS.MAP_EXPLORE_LAST_DAY);
    if (typeof persistedDay !== "number") {
        return 1;
    }

    return Math.max(1, Math.min(maxDays, persistedDay));
}
