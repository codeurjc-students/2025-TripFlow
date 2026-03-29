import type { MapPlace, MapSuggestion } from "@/types/map";

const BASE_SUGGESTIONS: MapSuggestion[] = [
  {
    id: "mock-madrid-retiro",
    name: "Parque del Retiro",
    fullAddress: "Plaza de la Independencia, Madrid",
    placeFormatted: "Parque del Retiro, Madrid",
    featureType: "park",
    center: { latitude: 40.4153, longitude: -3.6844 },
    categories: ["park", "outdoors"],
  },
  {
    id: "mock-madrid-prado",
    name: "Museo del Prado",
    fullAddress: "C. de Ruiz de Alarcon 23, Madrid",
    placeFormatted: "Museo del Prado, Madrid",
    featureType: "museum",
    center: { latitude: 40.4138, longitude: -3.6921 },
    categories: ["museum", "culture"],
  },
  {
    id: "mock-madrid-almudena",
    name: "Catedral de la Almudena",
    fullAddress: "C. de Bailen 10, Madrid",
    placeFormatted: "Catedral de la Almudena, Madrid",
    featureType: "church",
    center: { latitude: 40.4150, longitude: -3.7143 },
    categories: ["landmark", "history"],
  },
  {
    id: "mock-madrid-debod",
    name: "Templo de Debod",
    fullAddress: "C. de Ferraz 1, Madrid",
    placeFormatted: "Templo de Debod, Madrid",
    featureType: "landmark",
    center: { latitude: 40.4240, longitude: -3.7174 },
    categories: ["landmark", "sunset"],
  },
];

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function normalize(value: string | null): string {
  return (value || "").trim().toLowerCase();
}

export const mockMaps = {
  "/api/v1/maps/search/suggest": async (
    method: string,
    _body?: unknown,
    url?: string
  ): Promise<{ suggestions: MapSuggestion[] }> => {
    if (method !== "GET") {
      throw new Error(`Method ${method} not allowed on /api/v1/maps/search/suggest`);
    }

    const queryString = url?.split("?")[1] || "";
    const query = new URLSearchParams(queryString);
    const q = normalize(query.get("q"));
    const lat = Number(query.get("lat"));
    const lon = Number(query.get("lon"));
    const radiusKm = Number(query.get("radiusKm") || "10");

    let suggestions = BASE_SUGGESTIONS;

    if (q) {
      suggestions = suggestions.filter((item) => {
        const haystack = `${item.name} ${item.fullAddress} ${item.categories.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      suggestions = suggestions.filter((item) => {
        if (!item.center) return false;
        return distanceKm(lat, lon, item.center.latitude, item.center.longitude) <= radiusKm;
      });
    }

    const limit = Math.min(Number(query.get("limit") || "10"), 10);
    return { suggestions: suggestions.slice(0, limit) };
  },

  "/api/v1/maps/search/retrieve/:id": async (
    method: string,
    _body?: unknown,
    url?: string
  ): Promise<MapPlace> => {
    if (method !== "GET") {
      throw new Error(`Method ${method} not allowed on /api/v1/maps/search/retrieve/:id`);
    }

    const id = decodeURIComponent((url?.split("?")[0] || "").split("/").pop() || "");
    const found = BASE_SUGGESTIONS.find((item) => item.id === id) || BASE_SUGGESTIONS[0];

    return {
      id: found.id,
      name: found.name,
      fullAddress: found.fullAddress,
      placeFormatted: found.placeFormatted,
      featureType: found.featureType,
      center: found.center || { latitude: 40.4168, longitude: -3.7038 },
      categories: found.categories,
    };
  },
};
