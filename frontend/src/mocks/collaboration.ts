import type { Collaborator, AddCollaboratorRequest, UpdateCollaboratorRequest } from "@/types/collaboration";

let collaborators: Collaborator[] = [
    {
        id: 1,
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

export const mockCollaboration: Record<string, (method: string, body?: unknown, url?: string) => Promise<unknown>> = {
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

        const index = collaborators.findIndex(
            (c) => c.user.username === username
        );
        if (index === -1) throw new Error("Invitación no encontrada");

        collaborators[index] = {
            ...collaborators[index],
            status: "ACCEPTED",
            acceptedAt: new Date().toISOString(),
        };
        return collaborators[index];
    },

    "/api/v1/itineraries/:id/collaborators/:username/decline": async (
        _method: string,
        _body?: unknown,
        url?: string
    ): Promise<void> => {
        const parts = url?.split("/") || [];
        const username = parts[parts.length - 2];

        const index = collaborators.findIndex(
            (c) => c.user.username === username
        );
        if (index === -1) throw new Error("Invitación no encontrada");

        collaborators = collaborators.filter(
            (c) => c.user.username !== username
        );
    },
};
