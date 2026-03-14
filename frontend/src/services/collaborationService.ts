import type { Collaborator, AddCollaboratorRequest, UpdateCollaboratorRequest } from "@/types/collaboration";

import { http } from "@services/httpService";

const BASE_PATH = "/api/v1/itineraries";
const USERS_PATH = "/api/v1/users";

/**
 * Retrieves all pending collaboration invitations for a user.
 *
 * @param username The username of the user.
 * @returns A promise that resolves to the list of pending invitations.
 */
export async function getPendingInvitations(username: string): Promise<Collaborator[]> {
    return http<Collaborator[]>(`${USERS_PATH}/${username}/invitations`, "GET");
}

/**
 * Retrieves all collaborators of an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @returns A promise that resolves to the list of collaborators.
 */
export async function getCollaborators(itineraryId: number): Promise<Collaborator[]> {
    return http<Collaborator[]>(`${BASE_PATH}/${itineraryId}/collaborators`, "GET");
}

/**
 * Sends an invitation to a user to collaborate on an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @param request The invitation request containing username and role.
 * @returns A promise that resolves to the created collaborator.
 */
export async function sendInvitation(
    itineraryId: number,
    request: AddCollaboratorRequest
): Promise<Collaborator> {
    return http<Collaborator>(`${BASE_PATH}/${itineraryId}/collaborators`, "POST", request);
}

/**
 * Accepts a pending invitation to collaborate on an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @param username The username of the collaborator accepting the invitation.
 * @returns A promise that resolves to the updated collaborator.
 */
export async function acceptInvitation(
    itineraryId: number,
    username: string
): Promise<Collaborator> {
    return http<Collaborator>(`${BASE_PATH}/${itineraryId}/collaborators/${username}/accept`, "PUT");
}

/**
 * Declines a pending invitation to collaborate on an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @param username The username of the collaborator declining the invitation.
 * @returns A promise that resolves when the invitation is declined.
 */
export async function declineInvitation(
    itineraryId: number,
    username: string
): Promise<void> {
    return http<void>(`${BASE_PATH}/${itineraryId}/collaborators/${username}/decline`, "DELETE");
}

/**
 * Updates a collaborator's role on an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @param username The username of the collaborator to update.
 * @param request The update request containing the new role.
 * @returns A promise that resolves to the updated collaborator.
 */
export async function updateCollaboratorRole(
    itineraryId: number,
    username: string,
    request: UpdateCollaboratorRequest
): Promise<Collaborator> {
    return http<Collaborator>(`${BASE_PATH}/${itineraryId}/collaborators/${username}`, "PUT", request);
}

/**
 * Removes a collaborator from an itinerary.
 *
 * @param itineraryId The unique identifier of the itinerary.
 * @param username The username of the collaborator to remove.
 * @returns A promise that resolves when the collaborator is removed.
 */
export async function removeCollaborator(
    itineraryId: number,
    username: string
): Promise<void> {
    return http<void>(`${BASE_PATH}/${itineraryId}/collaborators/${username}`, "DELETE");
}
