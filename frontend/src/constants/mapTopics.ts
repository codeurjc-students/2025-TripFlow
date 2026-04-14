export interface MapTopicOption {
    key: string;
    label: string;
    query: string;
    category?: string;
}

export const MAP_TOPIC_OPTIONS: MapTopicOption[] = [
    { key: "restaurant", label: "Restaurantes", query: "restaurant", category: "food" },
    { key: "cafe", label: "Cafés", query: "cafe", category: "food" },
    { key: "bar", label: "Bares", query: "bar", category: "nightlife" },
    { key: "nightclub", label: "Copas", query: "nightclub", category: "nightlife" },
    { key: "museum", label: "Museos", query: "museum", category: "culture" },
    { key: "hotel", label: "Hoteles", query: "hotel", category: "accommodation" },
    { key: "attraction", label: "Atracciones", query: "attraction", category: "tourism" },
    { key: "park", label: "Parques", query: "park", category: "outdoors" },
    { key: "shop", label: "Tiendas", query: "shop", category: "shopping" },
];
