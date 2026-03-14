import type { Collaborator, AddCollaboratorRequest, UpdateCollaboratorRequest } from "@/types/collaboration";

let collaborators: Collaborator[] = [
    {
        id: 1,
        fromUser: "cub1z",
        user: {
            username: "maria_garcia",
            name: "María García",
            description: "Amante de los viajes",
            location: "Madrid, España",
            notificationsAllowed: true,
            createdAt: "2025-01-15T10:00:00",
            role: "USER",
            plan: "PRO",
        },
        role: "EDITOR",
        status: "ACCEPTED",
        invitedAt: "2025-03-01T12:00:00",
        acceptedAt: "2025-03-01T14:30:00",
        itineraryId: 1,
        itineraryTitle: "Primavera en Tokio",
    },
    {
        id: 2,
        fromUser: "cub1z",
        user: {
            username: "carlos_lopez",
            name: "Carlos López",
            description: "Fotógrafo viajero",
            location: "Barcelona, España",
            notificationsAllowed: true,
            createdAt: "2025-02-10T08:00:00",
            role: "USER",
            plan: "FREE",
        },
        role: "VIEWER",
        status: "ACCEPTED",
        invitedAt: "2025-03-02T09:00:00",
        acceptedAt: "2025-03-02T11:00:00",
        itineraryId: 1,
        itineraryTitle: "Primavera en Tokio",
    },
    {
        id: 3,
        fromUser: "cub1z",
        user: {
            username: "ana_martinez",
            name: "Ana Martínez",
            description: "Exploradora urbana",
            location: "Valencia, España",
            notificationsAllowed: true,
            createdAt: "2025-01-20T14:00:00",
            role: "USER",
            plan: "PREMIUM",
        },
        role: "EDITOR",
        status: "PENDING",
        invitedAt: "2025-03-05T16:00:00",
        acceptedAt: null,
        itineraryId: 1,
        itineraryTitle: "Primavera en Tokio",
    },
];

let nextId = 4;

let pendingInvitations: Collaborator[] = [
    {
        id: 10,
        fromUser: "cub1z",
        user: {
            username: "sarah_smith",
            name: "Sarah Smith",
            description: "Travel planner",
            location: "London, UK",
            notificationsAllowed: true,
            createdAt: "2025-02-01T10:00:00",
            role: "USER",
            plan: "PRO",
        },
        role: "EDITOR",
        status: "PENDING",
        invitedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        acceptedAt: null,
        itineraryId: 5,
        itineraryTitle: "Verano en Tokio",
    },
    {
        id: 11,
        fromUser: "cub1z",
        user: {
            username: "pedro_ruiz",
            name: "Pedro Ruiz",
            description: "Aventurero digital",
            location: "Sevilla, España",
            notificationsAllowed: true,
            createdAt: "2025-01-10T08:00:00",
            role: "USER",
            plan: "FREE",
        },
        role: "VIEWER",
        status: "PENDING",
        invitedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        acceptedAt: null,
        itineraryId: 8,
        itineraryTitle: "Ruta por los Alpes",
    },
    {
        id: 12,
        fromUser: "cub1z",
        user: {
            username: "lucia_fernandez",
            name: "Lucía Fernández",
            description: "Foodie viajera",
            location: "México DF, México",
            notificationsAllowed: true,
            createdAt: "2025-03-01T12:00:00",
            role: "USER",
            plan: "PREMIUM",
        },
        role: "EDITOR",
        status: "PENDING",
        invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: null,
        itineraryId: 3,
        itineraryTitle: "Gastronomía en París",
    },
];

export const mockCollaboration: Record<string, (method: string, body?: unknown, url?: string) => Promise<unknown>> = {
    "/api/v1/users/:username/invitations": async (
        _method: string,
    ): Promise<Collaborator[]> => {
        return [...pendingInvitations];
    },

    "/api/v1/itineraries/:id/collaborators": async (
        method: string,
        body?: unknown,
        url?: string
    ): Promise<Collaborator[] | Collaborator> => {
        switch (method) {
            case "GET":
                return [...collaborators];

            case "POST": {
                const request = body as AddCollaboratorRequest;

                const existing = collaborators.find(
                    (c) => c.user.username === request.username
                );
                if (existing) throw new Error("El usuario ya es colaborador o tiene una invitación pendiente");

                const newCollaborator: Collaborator = {
                    id: nextId++,
                    fromUser: "cub1z",
                    user: {
                        username: request.username,
                        name: request.username,
                        description: "",
                        location: "",
                        notificationsAllowed: true,
                        createdAt: new Date().toISOString(),
                        role: "USER",
                        plan: "FREE",
                    },
                    role: request.role,
                    status: "PENDING",
                    invitedAt: new Date().toISOString(),
                    acceptedAt: null,
                    itineraryId: Number(url?.split("/")[4]) || 1,
                    itineraryTitle: "Itinerario",
                };

                collaborators.push(newCollaborator);
                return newCollaborator;
            }

            default:
                throw new Error(`Method ${method} not allowed`);
        }
    },

    "/api/v1/itineraries/:id/collaborators/:username": async (
        method: string,
        body?: unknown,
        url?: string
    ): Promise<Collaborator | void> => {
        const parts = url?.split("/") || [];
        const username = parts[parts.length - 1];

        switch (method) {
            case "PUT": {
                const request = body as UpdateCollaboratorRequest;
                const index = collaborators.findIndex(
                    (c) => c.user.username === username
                );
                if (index === -1) throw new Error("Colaborador no encontrado");

                collaborators[index] = {
                    ...collaborators[index],
                    role: request.role,
                };
                return collaborators[index];
            }

            case "DELETE": {
                const index = collaborators.findIndex(
                    (c) => c.user.username === username
                );
                if (index === -1) throw new Error("Colaborador no encontrado");

                collaborators = collaborators.filter(
                    (c) => c.user.username !== username
                );
                return;
            }

            default:
                throw new Error(`Method ${method} not allowed`);
        }
    },

    "/api/v1/itineraries/:id/collaborators/:username/accept": async (
        _method: string,
        _body?: unknown,
        url?: string
    ): Promise<Collaborator> => {
        const parts = url?.split("/") || [];
        const username = parts[parts.length - 2];

        // Check in collaborators first
        const index = collaborators.findIndex(
            (c) => c.user.username === username
        );
        if (index !== -1) {
            collaborators[index] = {
                ...collaborators[index],
                status: "ACCEPTED",
                acceptedAt: new Date().toISOString(),
            };
            return collaborators[index];
        }

        // Check in pending invitations
        const pendingIndex = pendingInvitations.findIndex(
            (c) => c.user.username === username
        );
        if (pendingIndex === -1) throw new Error("Invitación no encontrada");

        const accepted = {
            ...pendingInvitations[pendingIndex],
            status: "ACCEPTED" as const,
            acceptedAt: new Date().toISOString(),
        };
        pendingInvitations = pendingInvitations.filter(
            (c) => c.user.username !== username
        );
        return accepted;
    },

    "/api/v1/itineraries/:id/collaborators/:username/decline": async (
        _method: string,
        _body?: unknown,
        url?: string
    ): Promise<void> => {
        const parts = url?.split("/") || [];
        const username = parts[parts.length - 2];

        // Remove from collaborators
        const collabIndex = collaborators.findIndex(
            (c) => c.user.username === username
        );
        if (collabIndex !== -1) {
            collaborators = collaborators.filter(
                (c) => c.user.username !== username
            );
            return;
        }

        // Remove from pending invitations
        const pendingIndex = pendingInvitations.findIndex(
            (c) => c.user.username === username
        );
        if (pendingIndex === -1) throw new Error("Invitación no encontrada");

        pendingInvitations = pendingInvitations.filter(
            (c) => c.user.username !== username
        );
    },
};
