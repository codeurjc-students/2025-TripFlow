import styles from "@styles/components/map/MapBottomSheet.module.css";

import { MapPinIcon } from "lucide-react";

import type { MapWaypoint } from "@/utils/mapGeometry";

import MapActivityCard from "@/components/map/MapActivityCard";
import MapBottomPanelBase from "@/components/map/MapBottomPanelBase";

interface MapBottomSheetProps {
    waypoints: MapWaypoint[];
    dayNumbers: number[];
    selectedDay: number | null;
    onDayChange: (day: number | null) => void;
    selectedWaypointIndex: number | null;
    onSelectWaypoint: (index: number | null) => void;
    invalidCount: number;
    itineraryTitle: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    offsetForMobileNav?: boolean;
}

export default function MapBottomSheet({
    waypoints,
    dayNumbers,
    selectedDay,
    onDayChange,
    selectedWaypointIndex,
    onSelectWaypoint,
    invalidCount,
    itineraryTitle,
    isCollapsed,
    onToggleCollapse,
    offsetForMobileNav = true,
}: MapBottomSheetProps) {
    const hasInvalid = invalidCount > 0;
    const invalidLabel = invalidCount === 1
        ? "1 ubicación sin coordenadas"
        : `${invalidCount} ubicaciones sin coordenadas`;

    return (
        <MapBottomPanelBase
            title={itineraryTitle}
            subtitle="Actividades y ubicaciones"
            ariaLabel="Panel de actividades del itinerario"
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
            offsetForMobileNav={offsetForMobileNav}
        >
            {dayNumbers.length > 1 && (
                <div className={styles.filters} role="tablist" aria-label="Filtrar por día">
                    <button
                        className={`${styles.chip} ${selectedDay === null ? styles.chipActive : ""}`}
                        onClick={() => onDayChange(null)}
                        role="tab"
                        aria-selected={selectedDay === null}
                        aria-label="Mostrar todos los días"
                    >
                        Todos
                    </button>
                    {dayNumbers.map((day) => (
                        <button
                            key={day}
                            className={`${styles.chip} ${selectedDay === day ? styles.chipActive : ""}`}
                            onClick={() => onDayChange(day)}
                            role="tab"
                            aria-selected={selectedDay === day}
                            aria-label={`Filtrar día ${day}`}
                        >
                            Día {day}
                        </button>
                    ))}
                </div>
            )}

            {hasInvalid && (
                <div className={styles.warning}>{invalidLabel}</div>
            )}

            <div className={styles.cardList}>
                {waypoints.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MapPinIcon size={18} />
                        <p>Sin ubicaciones</p>
                    </div>
                ) : (
                    waypoints.map((wp, index) => (
                        <MapActivityCard
                            key={`${wp.dayNumber}-${wp.activityIndex}`}
                            waypoint={wp}
                            isSelected={selectedWaypointIndex === index}
                            onClick={() => onSelectWaypoint(index)}
                        />
                    ))
                )}
            </div>
        </MapBottomPanelBase>
    );
}
