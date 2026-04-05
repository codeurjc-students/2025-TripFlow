import type { UserStatsResponse, UsersByPlanStatsResponse } from "@/types/stats";
import { http } from "@services/httpService";

const BASE_PATH = "/api/v1/stats";

/**
 * Fetches statistics related to the user.
 *
 * @returns A promise that resolves to the user's statistics.
 */
export async function getUserStats(): Promise<UserStatsResponse> {
    return http<UserStatsResponse>(`${BASE_PATH}/user`, "GET");
}

/**
 * Fetches user distribution by plan for admin analytics.
 *
 * @returns A promise that resolves to users grouped by plan.
 */
export async function getUsersByPlanStats(): Promise<UsersByPlanStatsResponse> {
    return http<UsersByPlanStatsResponse>(`${BASE_PATH}/users-by-plan`, "GET");
}
