import styles from "@styles/components/map/MapPoiCard.module.css";

import type { MapSuggestion } from "@/types/map";
import MapInfoCardBase from "@/components/map/MapInfoCardBase";

interface MapPoiCardProps {
    place: MapSuggestion;
    isSelected: boolean;
    onClick: () => void;
    distanceKm?: number | null;
}

const FEATURE_LABELS: Record<string, string> = {
    poi: "Lugar",
    locality: "Zona",
    neighborhood: "Barrio",
};

export default function MapPoiCard({ place, isSelected, onClick, distanceKm }: MapPoiCardProps) {
    const hasAddress = Boolean((place.fullAddress || place.placeFormatted).trim());
    const featureType = (place.featureType || "poi").toLowerCase();
    const featureLabel = FEATURE_LABELS[featureType] || featureType;
    const primaryCategory = place.categories.find((category) => category && category.toLowerCase() !== "poi");
    const distanceLabel = typeof distanceKm === "number" ? `${distanceKm.toFixed(1)} km` : null;

    const metaParts = [primaryCategory, distanceLabel].filter(Boolean).join(" · ");

    return (
        <MapInfoCardBase
            title={place.name}
            subtitle={hasAddress ? (place.fullAddress || place.placeFormatted) : undefined}
            badge={featureLabel}
            meta={metaParts ? <span className={styles.meta}>{metaParts}</span> : undefined}
            isSelected={isSelected}
            onClick={onClick}
            ariaLabel={`${place.name}${hasAddress ? ` - ${place.fullAddress || place.placeFormatted}` : ""}`}
        />
    );
}
