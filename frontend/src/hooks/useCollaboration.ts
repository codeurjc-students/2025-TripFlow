import { useCallback, useEffect, useState } from "react";

import type { Collaborator, CollaboratorRole, ShareLink } from "@/types/collaboration";

import {
    getCollaborators,
    getShareLinks,
    generateShareLink as generateShareLinkService,
    revokeShareLink as revokeShareLinkService,
    sendInvitation,
    updateCollaboratorRole,
    removeCollaborator as removeCollaboratorService,
} from "@/services/collaborationService";

import { useNotification } from "@/providers/notificationProvider";
import { useWebSocketNotifications } from "@/hooks/notifications/useWebSocketNotifications";
import { useCollaborationEvents } from "@/hooks/notifications/useCollaborationEvents";

/**
 * Custom hook to manage collaboration state and actions for an itinerary.
 */
export function useCollaboration(itineraryId: number) {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareLinksLoading, setIsShareLinksLoading] = useState(false);

    const { notify } = useNotification();

    const fetchCollaborators = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await getCollaborators(itineraryId);
            setCollaborators(data);
        } catch {
            if (!silent) notify("Error al cargar los colaboradores", "error");
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [itineraryId, notify]);

    const fetchShareLinks = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsShareLinksLoading(true);
            const data = await getShareLinks(itineraryId);
            setShareLinks(data);
        } catch {
            if (!silent) notify("Error al cargar los enlaces compartidos", "error");
        } finally {
            if (!silent) setIsShareLinksLoading(false);
        }
    }, [itineraryId, notify]);

    const silentRefresh = useCallback(() => {
        fetchCollaborators(true);
    }, [fetchCollaborators]);

    useWebSocketNotifications({
        types: ["INVITATION_RECEIVED", "INVITATION_ACCEPTED"],
        onNotification: silentRefresh,
    });

    useCollaborationEvents(itineraryId, {
        onEvent: silentRefresh,
    });

    const inviteCollaborator = async (username: string, role: CollaboratorRole) => {
        try {
            await sendInvitation(itineraryId, { username, role });
            await fetchCollaborators();
            notify("Invitación enviada correctamente", "success");
            return true;
        } catch {
            notify("Error al enviar la invitación", "error");
            return false;
        }
    };

    const updateRole = async (username: string, role: CollaboratorRole) => {
        try {
            await updateCollaboratorRole(itineraryId, username, { role });
            await fetchCollaborators();
            notify("Rol actualizado correctamente", "success");
            return true;
        } catch {
            notify("Error al actualizar el rol", "error");
            return false;
        }
    };

    const removeCollaborator = async (username: string) => {
        try {
            await removeCollaboratorService(itineraryId, username);
            await fetchCollaborators();
            notify("Colaborador eliminado correctamente", "success");
            return true;
        } catch {
            notify("Error al eliminar el colaborador", "error");
            return false;
        }
    };

    const leaveItinerary = async (username: string) => {
        try {
            await removeCollaboratorService(itineraryId, username);
            notify("Has abandonado el itinerario", "info");
            return true;
        } catch {
            notify("Error al abandonar el itinerario", "error");
            return false;
        }
    };

    const generateShareLink = async () => {
        try {
            const newShareLink = await generateShareLinkService(itineraryId);
            await fetchShareLinks(true);
            return newShareLink;
        } catch {
            notify("Error al generar el enlace compartido", "error");
            return null;
        }
    };

    const revokeShareLink = async (shareLinkId: number) => {
        try {
            await revokeShareLinkService(itineraryId, shareLinkId);
            await fetchShareLinks(true);
            notify("Enlace revocado correctamente", "success");
            return true;
        } catch {
            notify("Error al revocar el enlace", "error");
            return false;
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    return {
        collaborators,
        shareLinks,
        isLoading,
        isShareLinksLoading,
        inviteCollaborator,
        updateRole,
        removeCollaborator,
        leaveItinerary,
        generateShareLink,
        revokeShareLink,
        loadShareLinks: fetchShareLinks,
    };
}
