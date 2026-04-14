import { useCallback, useEffect, useState } from "react";

import type { Collaborator } from "@/types/collaboration";

import {
    getPendingInvitations,
    acceptInvitation,
    declineInvitation,
} from "@/services/collaborationService";

import { useAuth } from "@/providers/authProvider";
import { useNotification } from "@/providers/notificationProvider";
import { useWebSocketNotifications } from "@/hooks/notifications/useWebSocketNotifications";

export function useNotifications() {
    const { user } = useAuth();
    const { notify } = useNotification();

    const [invitations, setInvitations] = useState<Collaborator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    const fetchInvitations = useCallback(async (silent = false) => {
        if (!user) return;
        try {
            if (!silent) setIsLoading(true);
            const data = await getPendingInvitations(user.username);
            setInvitations(data);
        } catch {
            if (!silent) notify("Error al cargar las invitaciones", "error");
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [user, notify]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const silentRefresh = useCallback(() => {
        fetchInvitations(true);
    }, [fetchInvitations]);

    useWebSocketNotifications({
        types: ["INVITATION_RECEIVED", "INVITATION_ACCEPTED"],
        onNotification: silentRefresh,
    });

    const handleAccept = async (invitation: Collaborator) => {
        setProcessingIds((prev) => new Set(prev).add(invitation.id));
        try {
            await acceptInvitation(invitation.itineraryId, invitation.user.username);
            setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
            notify("Invitación aceptada correctamente", "success");
        } catch {
            notify("Error al aceptar la invitación", "error");
        } finally {
            setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(invitation.id);
                return next;
            });
        }
    };

    const handleDecline = async (invitation: Collaborator) => {
        setProcessingIds((prev) => new Set(prev).add(invitation.id));
        try {
            await declineInvitation(invitation.itineraryId, invitation.user.username);
            setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
            notify("Invitación rechazada", "info");
        } catch {
            notify("Error al rechazar la invitación", "error");
        } finally {
            setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(invitation.id);
                return next;
            });
        }
    };

    return {
        invitations,
        isLoading,
        processingIds,
        handleAccept,
        handleDecline,
    };
}
