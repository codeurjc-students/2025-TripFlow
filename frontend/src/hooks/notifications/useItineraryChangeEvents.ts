import { useEffect } from "react";

import { useWebSocket } from "@/providers/webSocketProvider";
import { useAuth } from "@/providers/authProvider";

import type { ItineraryChangeEvent } from "@/types/itinerary";

interface UseItineraryChangeEventsOptions {
    ignoreSelf?: boolean;
    onEvent?: (event: ItineraryChangeEvent) => void;
}

/**
 * Hook to listen for itinerary change events for a given itinerary.
 */
export const useItineraryChangeEvents = (
    itineraryId: number,
    options?: UseItineraryChangeEventsOptions
) => {
    const ws = useWebSocket();
    const { user } = useAuth();

    const { onEvent, ignoreSelf = true } = options || {};

    useEffect(() => {
        if (!ws?.client?.connected) return;
        if (!onEvent) return;

        const destination = `/topic/itineraries/${itineraryId}/changes`;
        const subscription = ws.subscribe(destination, (message) => {
            try {
                const event: ItineraryChangeEvent = JSON.parse(message.body);
                if (event.itineraryId !== itineraryId) return;
                if (ignoreSelf && user?.username && event.actorUsername === user.username) return;
                onEvent(event);
            } catch {
                // Ignore malformed events
            }
        });

        return () => subscription?.unsubscribe();
    }, [ws?.client?.connected, ws, itineraryId, onEvent, ignoreSelf, user?.username]);
};
