import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCollaborationEvents } from "../../src/hooks/notifications/useCollaborationEvents";

let wsConnected = true;
const subscribeMock = vi.fn();
const unsubscribeMock = vi.fn();
let lastDestination: string | null = null;
let lastCallback: ((message: { body: string }) => void) | null = null;

vi.mock("@/providers/webSocketProvider", () => ({
    useWebSocket: () => ({
        client: { connected: wsConnected },
        subscribe: subscribeMock,
    }),
}));

describe("useCollaborationEvents", () => {
    beforeEach(() => {
        wsConnected = true;
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

    it("should subscribe to the collaboration topic", async () => {
        const onEvent = vi.fn();
        renderHook(() => useCollaborationEvents(4, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());
        expect(lastDestination).toBe("/topic/itineraries/4/collaboration");
    });

    it("should trigger onEvent for matching events", async () => {
        const onEvent = vi.fn();
        renderHook(() => useCollaborationEvents(4, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());

        act(() => {
            lastCallback?.({
                body: JSON.stringify({
                    itineraryId: 4,
                    eventType: "INVITE_ACCEPTED",
                    actorUsername: "actor",
                    targetUsername: "target",
                    timestamp: "2026-03-20T00:00:00Z",
                }),
            });
        });

        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("should ignore events for another itinerary", async () => {
        const onEvent = vi.fn();
        renderHook(() => useCollaborationEvents(4, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());

        act(() => {
            lastCallback?.({
                body: JSON.stringify({
                    itineraryId: 99,
                    eventType: "INVITE_SENT",
                    actorUsername: "actor",
                    targetUsername: "target",
                    timestamp: "2026-03-20T00:00:00Z",
                }),
            });
        });

        expect(onEvent).not.toHaveBeenCalled();
    });

    it("should ignore malformed events", async () => {
        const onEvent = vi.fn();
        renderHook(() => useCollaborationEvents(4, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());

        act(() => {
            lastCallback?.({ body: "not-json" });
        });

        expect(onEvent).not.toHaveBeenCalled();
    });

    it("should unsubscribe on unmount", async () => {
        const onEvent = vi.fn();
        const { unmount } = renderHook(() => useCollaborationEvents(4, { onEvent }));

        await waitFor(() => expect(subscribeMock).toHaveBeenCalled());
        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
