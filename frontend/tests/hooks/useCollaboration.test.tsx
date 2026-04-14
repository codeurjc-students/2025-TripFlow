import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCollaboration } from "../../src/hooks/useCollaboration";

const {
    notifyMock,
    getCollaboratorsMock,
    getShareLinksMock,
    generateShareLinkMock,
    revokeShareLinkMock,
    sendInvitationMock,
    updateCollaboratorRoleMock,
    removeCollaboratorMock,
} = vi.hoisted(() => ({
    notifyMock: vi.fn(),
    getCollaboratorsMock: vi.fn(),
    getShareLinksMock: vi.fn(),
    generateShareLinkMock: vi.fn(),
    revokeShareLinkMock: vi.fn(),
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
    getShareLinks: getShareLinksMock,
    generateShareLink: generateShareLinkMock,
    revokeShareLink: revokeShareLinkMock,
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
    useCollaborationEvents: (_itineraryId: number, options: { onEvent?: () => void }) => {
        collaborationEventOptions = options;
    },
}));

describe("useCollaboration", () => {
    beforeEach(() => {
        notifyMock.mockReset();
        getCollaboratorsMock.mockReset();
        getShareLinksMock.mockReset();
        generateShareLinkMock.mockReset();
        revokeShareLinkMock.mockReset();
        sendInvitationMock.mockReset();
        updateCollaboratorRoleMock.mockReset();
        removeCollaboratorMock.mockReset();
        wsNotificationOptions = null;
        collaborationEventOptions = null;

        getCollaboratorsMock.mockResolvedValue([]);
        getShareLinksMock.mockResolvedValue([]);
        generateShareLinkMock.mockResolvedValue(undefined);
        revokeShareLinkMock.mockResolvedValue(undefined);
        sendInvitationMock.mockResolvedValue(undefined);
        updateCollaboratorRoleMock.mockResolvedValue(undefined);
        removeCollaboratorMock.mockResolvedValue(undefined);
    });

    it("should fetch collaborators on mount", async () => {
        renderHook(() => useCollaboration(12));

        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledWith(12));
        expect(getShareLinksMock).not.toHaveBeenCalled();
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

    it("should load share links on demand", async () => {
        const shareLinks = [
            {
                id: 99,
                token: "token_99",
                createdAt: "2026-03-21T10:00:00Z",
                expiresAt: "2026-03-28T10:00:00Z",
                active: true,
            },
        ];
        getShareLinksMock.mockResolvedValueOnce(shareLinks);

        const { result } = renderHook(() => useCollaboration(12));
        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        await act(async () => {
            await result.current.loadShareLinks();
        });

        expect(getShareLinksMock).toHaveBeenCalledWith(12);
        expect(result.current.shareLinks).toEqual(shareLinks);
    });

    it("should generate share link and refresh share links", async () => {
        const generated = {
            id: 101,
            token: "token_101",
            createdAt: "2026-03-21T10:00:00Z",
            expiresAt: "2026-03-28T10:00:00Z",
            active: true,
        };

        generateShareLinkMock.mockResolvedValueOnce(generated);
        getShareLinksMock.mockResolvedValueOnce([generated]);

        const { result } = renderHook(() => useCollaboration(12));
        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        let generatedResult = null;
        await act(async () => {
            generatedResult = await result.current.generateShareLink();
        });

        expect(generateShareLinkMock).toHaveBeenCalledWith(12);
        expect(getShareLinksMock).toHaveBeenCalledWith(12);
        expect(generatedResult).toEqual(generated);
        expect(result.current.shareLinks).toEqual([generated]);
    });

    it("should show error toast when generating share link fails", async () => {
        generateShareLinkMock.mockRejectedValueOnce(new Error("fail"));

        const { result } = renderHook(() => useCollaboration(12));
        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        let generatedResult = undefined;
        await act(async () => {
            generatedResult = await result.current.generateShareLink();
        });

        expect(generatedResult).toBeNull();
        expect(notifyMock).toHaveBeenCalledWith("Error al generar el enlace compartido", "error");
    });

    it("should revoke share link, refresh list and notify success", async () => {
        revokeShareLinkMock.mockResolvedValueOnce(undefined);
        getShareLinksMock.mockResolvedValueOnce([]);

        const { result } = renderHook(() => useCollaboration(12));
        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        let revokeResult = false;
        await act(async () => {
            revokeResult = await result.current.revokeShareLink(77);
        });

        expect(revokeShareLinkMock).toHaveBeenCalledWith(12, 77);
        expect(getShareLinksMock).toHaveBeenCalledWith(12);
        expect(revokeResult).toBe(true);
        expect(notifyMock).toHaveBeenCalledWith("Enlace revocado correctamente", "success");
    });

    it("should show error toast when revoking share link fails", async () => {
        revokeShareLinkMock.mockRejectedValueOnce(new Error("fail"));

        const { result } = renderHook(() => useCollaboration(12));
        await waitFor(() => expect(getCollaboratorsMock).toHaveBeenCalledTimes(1));

        let revokeResult = true;
        await act(async () => {
            revokeResult = await result.current.revokeShareLink(77);
        });

        expect(revokeResult).toBe(false);
        expect(notifyMock).toHaveBeenCalledWith("Error al revocar el enlace", "error");
    });
});
