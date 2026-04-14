import type { MapDirectionsProfile } from "@/types/map";

export const MAP_DIRECTIONS_PROFILE_OPTIONS: Array<{ value: MapDirectionsProfile; label: string }> = [
    { value: "DRIVING", label: "Coche" },
    { value: "DRIVING_TRAFFIC", label: "Coche (trafico)" },
    { value: "WALKING", label: "A pie" },
    { value: "CYCLING", label: "Bici" },
];
