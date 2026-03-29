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
