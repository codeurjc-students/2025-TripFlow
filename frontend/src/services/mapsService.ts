import type {
    MapPlace,
    MapSuggestParams,
    MapSuggestResponse,
} from "@/types/map";

import { http } from "@services/httpService";

const SEARCH_BASE_PATH = "/api/v1/maps/search";

function buildQueryString(params: MapSuggestParams): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") {
            continue;
        }
        search.set(key, String(value));
    }

    return search.toString();
}

export async function suggestPlaces(params: MapSuggestParams): Promise<MapSuggestResponse> {
    const query = buildQueryString(params);
    const path = query
        ? `${SEARCH_BASE_PATH}/suggest?${query}`
        : `${SEARCH_BASE_PATH}/suggest`;
    return http<MapSuggestResponse>(path, "GET");
}

export async function retrievePlace(id: string, language?: string): Promise<MapPlace> {
    const query = language ? `?language=${encodeURIComponent(language)}` : "";
    return http<MapPlace>(`${SEARCH_BASE_PATH}/retrieve/${encodeURIComponent(id)}${query}`, "GET");
}
