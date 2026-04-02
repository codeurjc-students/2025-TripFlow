export interface MapCoordinate {
    latitude: number;
    longitude: number;
}

export interface MapSuggestion {
    id: string;
    name: string;
    fullAddress: string;
    placeFormatted: string;
    featureType: string;
    center: MapCoordinate | null;
    categories: string[];
}

export interface MapSuggestResponse {
    suggestions: MapSuggestion[];
}

export interface MapPlace {
    id: string;
    name: string;
    fullAddress: string;
    placeFormatted: string;
    featureType: string;
    center: MapCoordinate;
    categories: string[];
}

export interface MapSuggestParams {
    q?: string;
    language?: string;
    limit?: number;
    proximity?: string;
    bbox?: string;
    country?: string;
    lat?: number;
    lon?: number;
    radiusKm?: number;
    category?: string;
}

export type MapDirectionsProfile = "DRIVING" | "DRIVING_TRAFFIC" | "WALKING" | "CYCLING";

export interface MapDirectionsRequest {
    profile: MapDirectionsProfile;
    waypoints: MapCoordinate[];
    alternatives?: boolean;
    steps?: boolean;
}

export interface MapRouteLeg {
    distance: number;
    duration: number;
    summary: string;
}

export interface MapRoute {
    distance: number;
    duration: number;
    geometry: MapCoordinate[];
    legs: MapRouteLeg[];
}

export interface MapDirectionsResponse {
    routes: MapRoute[];
}
