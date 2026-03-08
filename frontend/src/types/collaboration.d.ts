import type { PublicUser } from "./user";

export type CollaboratorRole = "EDITOR" | "VIEWER" | "OWNER";
export type InvitationStatus = "PENDING" | "ACCEPTED";

export interface Collaborator {
    id: number;
    user: PublicUser;
    role: CollaboratorRole;
    status: InvitationStatus;
    invitedAt: string;
    acceptedAt: string | null;
    itineraryId: number;
    itineraryTitle: string;
}

export interface AddCollaboratorRequest {
    username: string;
    role: CollaboratorRole;
}

export interface UpdateCollaboratorRequest {
    role: CollaboratorRole;
}
