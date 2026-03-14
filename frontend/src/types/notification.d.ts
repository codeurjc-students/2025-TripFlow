export type NotificationType = "ITINERARY_GENERATED" | "ITINERARY_GENERATION_FAILED" | "INVITATION_RECEIVED" | "INVITATION_ACCEPTED";

export interface Notification {
    username: string;
    message: string;
    type: NotificationType;
    timestamp: string;
}