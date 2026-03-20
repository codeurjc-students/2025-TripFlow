import { useEffect } from "react";

import { useWebSocket } from "@/providers/webSocketProvider";

import type { CollaborationEvent } from "@/types/collaboration";

interface UseCollaborationEventsOptions {
    onEvent?: (event: CollaborationEvent) => void;
}

/**
 * Hook to listen for collaboration events for a given itinerary.
 */
export const useCollaborationEvents = (
    itineraryId: number,
    options?: UseCollaborationEventsOptions
) => {
    const ws = useWebSocket();
    const { onEvent } = options || {};

    useEffect(() => {
        if (!ws?.client?.connected) return;
        if (!onEvent) return;

        const destination = `/topic/itineraries/${itineraryId}/collaboration`;
        const subscription = ws.subscribe(destination, (message) => {
            try {
                const event: CollaborationEvent = JSON.parse(message.body);
                if (event.itineraryId !== itineraryId) return;
                onEvent(event);
            } catch {
                // Ignore malformed events
            }
        });

        return () => subscription?.unsubscribe();
    }, [ws?.client?.connected, ws, itineraryId, onEvent]);
};
