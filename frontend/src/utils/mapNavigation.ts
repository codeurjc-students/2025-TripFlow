import type { MapSuggestion } from "@/types/map";

export function buildExternalNavigationUrl(
    place: MapSuggestion,
    origin?: { latitude: number; longitude: number } | null
): string | null {
    if (!place.center) {
        return null;
    }

    const destination = `${place.center.latitude},${place.center.longitude}`;
    if (origin) {
        const originValue = `${origin.latitude},${origin.longitude}`;
        return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originValue)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}
