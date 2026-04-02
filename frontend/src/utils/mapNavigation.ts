import type { MapSuggestion } from "@/types/map";
import type { MapDirectionsProfile } from "@/types/map";

function toGoogleTravelMode(profile: MapDirectionsProfile): "driving" | "walking" | "bicycling" {
    if (profile === "WALKING") return "walking";
    if (profile === "CYCLING") return "bicycling";
    return "driving";
}

export function buildExternalNavigationUrl(
    place: MapSuggestion,
    origin?: { latitude: number; longitude: number } | null,
    profile: MapDirectionsProfile = "DRIVING"
): string | null {
    if (!place.center) {
        return null;
    }

    const destination = `${place.center.latitude},${place.center.longitude}`;
    if (origin) {
        const originValue = `${origin.latitude},${origin.longitude}`;
        const travelMode = toGoogleTravelMode(profile);
        return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originValue)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}
