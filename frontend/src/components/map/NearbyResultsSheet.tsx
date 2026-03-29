import styles from "@styles/components/map/NearbyResultsSheet.module.css";

import type { MapSuggestion } from "@/types/map";
import { haversineDistanceKm } from "@/utils/mapDistance";
import MapBottomPanelBase from "@/components/map/MapBottomPanelBase";
import MapPoiCard from "@/components/map/MapPoiCard";

interface NearbyResultsSheetProps {
    places: MapSuggestion[];
    isLoading: boolean;
    selectedIndex: number | null;
    onSelect: (index: number) => void;
    selectedRadiusKm: number;
    onRadiusChange: (radiusKm: number) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    userCoords?: { latitude: number; longitude: number } | null;
    hasActiveCriteria: boolean;
}

const RADIUS_OPTIONS = [5, 10, 25];

export default function NearbyResultsSheet({
    places,
    isLoading,
    selectedIndex,
    onSelect,
    selectedRadiusKm,
    onRadiusChange,
    isCollapsed,
    onToggleCollapse,
    userCoords,
    hasActiveCriteria,
}: NearbyResultsSheetProps) {
    return (
        <MapBottomPanelBase
            title="Lugares cercanos"
            ariaLabel="Lugares cercanos"
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
        >
                <div className={styles.radiusRow}>
                    {RADIUS_OPTIONS.map((radius) => (
                        <button
                            key={radius}
                            type="button"
                            className={`${styles.radiusChip} ${selectedRadiusKm === radius ? styles.radiusChipActive : ""}`}
                            onClick={() => onRadiusChange(radius)}
                        >
                            {radius} km
                        </button>
                    ))}
                </div>

                <div className={styles.list}>
                    {isLoading ? (
                        <p className={styles.message}>Buscando lugares cercanos...</p>
                    ) : !hasActiveCriteria ? (
                        <p className={styles.message}>Escribe una búsqueda o selecciona un tema para empezar.</p>
                    ) : places.length === 0 ? (
                        <p className={styles.message}>No encontramos recomendaciones para este filtro.</p>
                    ) : (
                        places.map((place, index) => (
                            <MapPoiCard
                                key={place.id}
                                place={place}
                                isSelected={selectedIndex === index}
                                onClick={() => onSelect(index)}
                                distanceKm={userCoords && place.center
                                    ? haversineDistanceKm(
                                        userCoords.latitude,
                                        userCoords.longitude,
                                        place.center.latitude,
                                        place.center.longitude
                                    )
                                    : null}
                            />
                        ))
                    )}
                </div>
        </MapBottomPanelBase>
    );
}
