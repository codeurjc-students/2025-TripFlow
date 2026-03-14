import { useCallback, useEffect, useState } from "react";

import type { Collaborator, CollaboratorRole } from "@/types/collaboration";

import {
    getCollaborators,
    sendInvitation,
    updateCollaboratorRole,
    removeCollaborator as removeCollaboratorService,
} from "@/services/collaborationService";

import { useNotification } from "@/providers/notificationProvider";
import { useWebSocketNotifications } from "@/hooks/notifications/useWebSocketNotifications";

/**
 * Custom hook to manage collaboration state and actions for an itinerary.
 */
export function useCollaboration(itineraryId: number) {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { notify } = useNotification();

    const fetchCollaborators = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await getCollaborators(itineraryId);
            setCollaborators(data);
        } catch {
            if (!silent) notify("Error al cargar los colaboradores", "error");
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const silentRefresh = useCallback(() => {
        fetchCollaborators(true);
    }, [itineraryId]);

    useWebSocketNotifications({
        types: ["INVITATION_RECEIVED", "INVITATION_ACCEPTED"],
        onNotification: silentRefresh,
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

    useEffect(() => {
        fetchCollaborators();
    }, [itineraryId]);

    return {
        collaborators,
        isLoading,
        inviteCollaborator,
        updateRole,
        removeCollaborator,
        leaveItinerary,
    };
}
