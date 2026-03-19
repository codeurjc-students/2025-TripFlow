import styles from "@styles/components/map/MapBottomSheet.module.css";

import { ChevronDownIcon, ChevronUpIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";

import type { MapWaypoint } from "@/utils/mapGeometry";

import Button from "@components/shared/Button";
import MapActivityCard from "@/components/map/MapActivityCard";

interface MapBottomSheetProps {
    waypoints: MapWaypoint[];
    dayNumbers: number[];
    selectedDay: number | null;
    onDayChange: (day: number | null) => void;
    selectedWaypointIndex: number | null;
    onSelectWaypoint: (index: number | null) => void;
    invalidCount: number;
    itineraryTitle: string;
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
}: MapBottomSheetProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const hasInvalid = invalidCount > 0;
    const invalidLabel = invalidCount === 1
        ? "1 ubicacion sin coordenadas"
        : `${invalidCount} ubicaciones sin coordenadas`;

    return (
        <div
            className={`${styles.bottomSheet} ${isCollapsed ? styles.collapsed : ""}`}
            role="region"
            aria-label="Panel de actividades del itinerario"
        >
            <div className={styles.sheetHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.headerText}>
                        <h3 className={styles.sheetTitle}>{itineraryTitle}</h3>
                        <p className={styles.sheetSubtitle}>Actividades y ubicaciones</p>
                    </div>
                    <div className={styles.collapseButton}>
                        <Button
                            style={["tool_bordered", "rounded"]}
                            onClick={() => setIsCollapsed((prev) => !prev)}
                            ariaLabel={isCollapsed ? "Expandir panel" : "Contraer panel"}
                        >
                            {isCollapsed ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.sheetBody}>
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
            </div>
        </div>
    );
}
