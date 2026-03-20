import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useItineraryChangeEvents } from "../../src/hooks/notifications/useItineraryChangeEvents";

let wsConnected = true;
const subscribeMock = vi.fn();
const unsubscribeMock = vi.fn();
let lastDestination: string | null = null;
let lastCallback: ((message: { body: string }) => void) | null = null;
let authUser: { username: string } | null = { username: "alice" };

vi.mock("@/providers/webSocketProvider", () => ({
    useWebSocket: () => ({
        client: { connected: wsConnected },
        subscribe: subscribeMock,
    }),
}));

vi.mock("@/providers/authProvider", () => ({
    useAuth: () => ({ user: authUser }),
}));

describe("useItineraryChangeEvents", () => {
    beforeEach(() => {
        wsConnected = true;
        authUser = { username: "alice" };
        lastDestination = null;
        lastCallback = null;
        subscribeMock.mockReset();
        unsubscribeMock.mockReset();
        subscribeMock.mockImplementation((destination: string, callback: (message: { body: string }) => void) => {
            lastDestination = destination;
            lastCallback = callback;
            return { unsubscribe: unsubscribeMock } as any;
        });
    });

    it("should subscribe to the itinerary change topic", async () => {
        const onEvent = vi.fn();
        renderHook(() => useItineraryChangeEvents(7, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());
        expect(lastDestination).toBe("/topic/itineraries/7/changes");
    });

    it("should trigger onEvent for matching events", async () => {
        const onEvent = vi.fn();
        renderHook(() => useItineraryChangeEvents(7, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());

        act(() => {
            lastCallback?.({
                body: JSON.stringify({
                    itineraryId: 7,
                    changeType: "UPDATED",
                    actorUsername: "bob",
                    timestamp: "2026-03-20T00:00:00Z",
                }),
            });
        });

        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("should ignore events from the same user when ignoreSelf is true", async () => {
        authUser = { username: "bob" };
        const onEvent = vi.fn();
        renderHook(() => useItineraryChangeEvents(7, { onEvent, ignoreSelf: true }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());

        act(() => {
            lastCallback?.({
                body: JSON.stringify({
                    itineraryId: 7,
                    changeType: "UPDATED",
                    actorUsername: "bob",
                    timestamp: "2026-03-20T00:00:00Z",
                }),
            });
        });

        expect(onEvent).not.toHaveBeenCalled();
    });

    it("should unsubscribe on unmount", async () => {
        const onEvent = vi.fn();
        const { unmount } = renderHook(() => useItineraryChangeEvents(7, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());
        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
