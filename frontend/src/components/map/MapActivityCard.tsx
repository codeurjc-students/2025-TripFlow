import styles from "@styles/components/map/MapActivityCard.module.css";

import type { MapWaypoint } from "@/utils/mapGeometry";
import { Clock3 } from "lucide-react";

interface MapActivityCardProps {
    waypoint: MapWaypoint;
    isSelected: boolean;
    onClick: () => void;
}

export default function MapActivityCard({
    waypoint,
    isSelected,
    onClick,
}: MapActivityCardProps) {
    const { activity } = waypoint;
    const hasTime = activity.time && activity.time.trim().length > 0;
    const hasDuration = activity.duration && activity.duration.trim().length > 0;
    const hasAddress = activity.location.address && activity.location.address.trim().length > 0;

    return (
        <button
            className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
            onClick={onClick}
            aria-label={`${activity.activity} - ${activity.location.name}${hasAddress ? ` - ${activity.location.address}` : ""}${hasTime ? ` - ${activity.time}` : ""}`}
            aria-pressed={isSelected}
            type="button"
        >
            <div className={styles.cardContent}>
                <div className={styles.topRow}>
                    <span className={styles.cardTitle}>{activity.activity}</span>
                    <span className={styles.timePill}>{hasTime ? activity.time : "Sin hora"}</span>
                </div>

                {hasAddress && (
                    <p className={styles.cardAddress}>{activity.location.address}</p>
                )}

                <div className={styles.metaRow}>
                    {hasDuration && (
                        <span className={styles.metaItem}>
                            <Clock3 size={13} className={styles.metaIcon} aria-hidden="true" />
                            <span className={styles.cardDuration}>{activity.duration}</span>
                        </span>
                    )}
                    <span className={styles.metaItem}>
                        <span className={styles.dayText}>Dia {waypoint.dayNumber}</span>
                    </span>
                </div>
            </div>
        </button>
    );
}
