import { useState, useCallback } from "react";

import type {
    Activity,
    ExtendedItinerary,
    ItineraryDay,
} from "@/types/itinerary";

/**
 * Custom hook for managing itinerary form state and operations
 * Centralizes all the logic for updating itinerary data
 */
export function useItineraryForm(initialItinerary: ExtendedItinerary) {
    const [itinerary, setItinerary] = useState<ExtendedItinerary>(initialItinerary);

    // =================== BASIC INFORMATION MANAGEMENT ===================

    const updateBasicInfo = useCallback((field: keyof ExtendedItinerary, value: any) => {
        setItinerary(prev => ({ ...prev, [field]: value }));
    }, []);

    // =================== VALIDATION SYSTEM ===================

    const validateItinerary = useCallback((): { isValid: boolean; error?: string } => {
        if (!itinerary.title.trim()) {
            return { isValid: false, error: "Por favor, añade un título para tu itinerario." };
        }

        if (!itinerary.place.trim()) {
            return { isValid: false, error: "Por favor, añade un destino para tu viaje." };
        }

        if (itinerary.days.length === 0) {
            return { isValid: false, error: "Por favor, añade al menos un día a tu itinerario." };
        }

        return { isValid: true };
    }, [itinerary]);

    return {
        itinerary,
        setItinerary,
        updateBasicInfo,
        validateItinerary,
    };
}

/**
 * Creates a default itinerary object with initial values
 * Useful for initializing new itineraries
 *
 * @returns {ExtendedItinerary} Default itinerary structure
 */
export function createDefaultItinerary(): ExtendedItinerary {
    const today = new Date();

    const defaultDay: ItineraryDay = {
        day: 1,
        activities: [],
    };
    
    return {
        id: -1,
        title: "Nuevo Itinerario",
        place: "",
        people: 1,
        budget: 0,
        date: today.toISOString().split("T")[0],
        status: "DRAFT",
        countDays: 1,
        tags: [],
        days: [defaultDay],
        coverImage: {
            altDescription: "",
            imageUrl: "",
            authorUsername: "",
        },
        permissions: {
            view: true,
            edit: true,
            delete: true
        }
    };
}

/**
 * Creates a default activity object with empty fields
 * Useful for initializing new activities in the itinerary
 *
 * @returns {Activity} Default activity structure
 */
export function createDefaultActivity(): Activity {
    return {
        activity: "",
        details: "",
        location: {
            name: "",
            address: "",
            coordinates: {
                latitude: 0,
                longitude: 0,
            },
        },
        time: "",
        duration: "",
    };
}

/**
 * Creates a default day object with no activities
 * Useful for initializing new days in the itinerary
 *
 * @param {number} dayNumber - The day number to initialize
 * @returns {ItineraryDay} Default day structure
 */
export function createDefaultDay(dayNumber: number): ItineraryDay {
    return {
        day: dayNumber,
        activities: [],
    };
}
