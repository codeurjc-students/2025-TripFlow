import type { ExtendedItinerary, Itinerary } from "@/types/itinerary";
import type { PageRequest, PageResponse } from "@/types/shared";

import { http } from "@services/httpService";

const BASE_PATH = "/api/v1/itineraries";

/**
 * Retrieves a paginated list of itineraries for the current user.
 * 
 * @param pageParams Pagination parameters including page number and size.
 * @param search Optional search query to filter itineraries.
 * @returns A promise that resolves to a paginated response of itineraries.
 */
export async function getUserItineraries(
    pageParams: PageRequest = { page: 0, size: 10 },
    search?: string
): Promise<PageResponse<Itinerary>> {
    const pageParamsString = `page=${pageParams.page}&size=${pageParams.size}`;
    const searchParamsString = search ? `&search=${search}` : "";
    return http(`${BASE_PATH}?${pageParamsString}${searchParamsString}`, "GET");
}

/**
 * Retrieves the details of a specific itinerary by its ID.
 * 
 * @param itineraryId The unique identifier of the itinerary.
 * @returns A promise that resolves to the itinerary details.
 */
export async function getItineraryById(itineraryId: number): Promise<ExtendedItinerary> {
    return http(`${BASE_PATH}/${itineraryId}`, "GET");
}

/**
 * Retrieves a shared itinerary by token in read-only mode.
 *
 * @param token The share token.
 * @returns A promise that resolves to the shared itinerary details.
 */
export async function getSharedItineraryByToken(token: string): Promise<ExtendedItinerary> {
    return http(`/api/v1/share/${token}`, "GET");
}

/**
 * Creates a new itinerary with the provided details.
 *
 * @param itinerary The itinerary data to be created.
 * @returns A promise that resolves to the created itinerary.
 */
export async function createItinerary(itinerary: ExtendedItinerary): Promise<ExtendedItinerary> {
    return http(`${BASE_PATH}`, "POST", itinerary);
}

/**
 * Updates an existing itinerary with the provided details.
 *
 * @param itineraryId The unique identifier of the itinerary to be updated.
 * @param itinerary The updated itinerary data.
 * @returns A promise that resolves to the updated itinerary.
 */
export async function updateItinerary(itineraryId: number, itinerary: ExtendedItinerary): Promise<ExtendedItinerary> {
    return http(`${BASE_PATH}/${itineraryId}`, "PUT", itinerary);
}

/**
 * Deletes an itinerary by its ID.
 *
 * @param itineraryId The unique identifier of the itinerary to be deleted.
 * @returns A promise that resolves when the itinerary is deleted.
 */
export async function deleteItinerary(itineraryId: number): Promise<void> {
    return http(`${BASE_PATH}/${itineraryId}`, "DELETE");
}