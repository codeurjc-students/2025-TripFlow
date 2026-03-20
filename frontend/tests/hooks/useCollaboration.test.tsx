import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCollaboration } from "../../src/hooks/useCollaboration";

const {
    notifyMock,
    getCollaboratorsMock,
    sendInvitationMock,
    updateCollaboratorRoleMock,
    removeCollaboratorMock,
} = vi.hoisted(() => ({
    notifyMock: vi.fn(),
    getCollaboratorsMock: vi.fn(),
    sendInvitationMock: vi.fn(),
    updateCollaboratorRoleMock: vi.fn(),
    removeCollaboratorMock: vi.fn(),
}));

let wsNotificationOptions: { types?: string[]; onNotification?: () => void } | null = null;
let collaborationEventOptions: { onEvent?: () => void } | null = null;

vi.mock("@/providers/notificationProvider", () => ({
    useNotification: () => ({ notify: notifyMock }),
}));

vi.mock("@/services/collaborationService", () => ({
    getCollaborators: getCollaboratorsMock,
    sendInvitation: sendInvitationMock,
    updateCollaboratorRole: updateCollaboratorRoleMock,
    removeCollaborator: removeCollaboratorMock,
}));

vi.mock("@/hooks/notifications/useWebSocketNotifications", () => ({
    useWebSocketNotifications: (options: { types?: string[]; onNotification?: () => void }) => {
        wsNotificationOptions = options;
    },
}));

vi.mock("@/hooks/notifications/useCollaborationEvents", () => ({
    useCollaborationEvents: (itineraryId: number, options: { onEvent?: () => void }) => {
        collaborationEventOptions = options;
    },
}));

describe("useCollaboration", () => {
    beforeEach(() => {
        notifyMock.mockReset();
        getCollaboratorsMock.mockReset();
        sendInvitationMock.mockReset();
        updateCollaboratorRoleMock.mockReset();
        removeCollaboratorMock.mockReset();
        wsNotificationOptions = null;
        collaborationEventOptions = null;

        getCollaboratorsMock.mockResolvedValue([]);
        sendInvitationMock.mockResolvedValue(undefined);
        updateCollaboratorRoleMock.mockResolvedValue(undefined);
        removeCollaboratorMock.mockResolvedValue(undefined);
    });

    it("should fetch collaborators on mount", async () => {
        renderHook(() => useCollaboration(12));

        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledWith(12));
    });

    it("should send invitation and refresh collaborators", async () => {
        const { result } = renderHook(() => useCollaboration(12));

        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        await act(async () => {
            const ok = await result.current.inviteCollaborator("bob", "VIEWER");
            expect(ok).toBe(true);
        });

        expect(sendInvitationMock).toHaveBeenCalledWith(12, { username: "bob", role: "VIEWER" });
        expect(getCollaboratorsMock).toHaveBeenCalledTimes(2);
        expect(notifyMock).toHaveBeenCalledWith("Invitación enviada correctamente", "success");
    });

    it("should refresh collaborators on notification and collaboration events", async () => {
        renderHook(() => useCollaboration(12));

        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        act(() => {
            wsNotificationOptions?.onNotification?.();
            collaborationEventOptions?.onEvent?.();
        });

        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(3));
    });
});
