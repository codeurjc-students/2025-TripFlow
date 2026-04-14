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

export default function MapPoiCard({
    place,
    isSelected,
    onClick,
    distanceKm,
}: MapPoiCardProps) {
    const name = typeof place.name === "string" && place.name.trim().length > 0 ? place.name.trim() : "Lugar";
    const addressSource = typeof place.fullAddress === "string" && place.fullAddress.trim().length > 0
        ? place.fullAddress
        : place.placeFormatted;
    const address = typeof addressSource === "string" ? addressSource.trim() : "";
    const hasAddress = address.length > 0;
    const featureTypeRaw = typeof place.featureType === "string" ? place.featureType : "poi";
    const featureType = featureTypeRaw.toLowerCase();
    const featureLabel = FEATURE_LABELS[featureType] || featureType;
    const categories = Array.isArray(place.categories) ? place.categories : [];
    const primaryCategory = categories.find((category) => typeof category === "string" && category.toLowerCase() !== "poi");
    const distanceLabel = typeof distanceKm === "number" ? `${distanceKm.toFixed(1)} km` : null;

    const metaParts = [primaryCategory, distanceLabel].filter(Boolean).join(" · ");

    return (
        <MapInfoCardBase
            title={name}
            subtitle={hasAddress ? address : undefined}
            badge={featureLabel}
            meta={metaParts ? <span className={styles.meta}>{metaParts}</span> : undefined}
            isSelected={isSelected}
            onClick={onClick}
            ariaLabel={`${name}${hasAddress ? ` - ${address}` : ""}`}
        />
    );
}
