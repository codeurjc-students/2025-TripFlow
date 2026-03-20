import type { PublicUser } from "./user";

export type CollaboratorRole = "EDITOR" | "VIEWER" | "OWNER";
export type InvitationStatus = "PENDING" | "ACCEPTED";

export interface Collaborator {
    id: number;
    user: PublicUser;
    fromUser: string;
    role: CollaboratorRole;
    status: InvitationStatus;
    invitedAt: string;
    acceptedAt: string | null;
    itineraryId: number;
    itineraryTitle: string;
}

export type CollaborationEventType =
    | "INVITE_SENT"
    | "INVITE_ACCEPTED"
    | "INVITE_DECLINED"
    | "ROLE_UPDATED"
    | "COLLABORATOR_REMOVED";

export interface CollaborationEvent {
    itineraryId: number;
    eventType: CollaborationEventType;
    actorUsername: string;
    targetUsername: string;
    role?: CollaboratorRole;
    timestamp: string;
}

export interface AddCollaboratorRequest {
    username: string;
    role: CollaboratorRole;
}

export interface UpdateCollaboratorRequest {
    role: CollaboratorRole;
}
