import styles from "@styles/components/map/MapActivityCard.module.css";

import type { MapWaypoint } from "@/utils/mapGeometry";
import { Clock3 } from "lucide-react";
import MapInfoCardBase from "@/components/map/MapInfoCardBase";

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
        <MapInfoCardBase
            title={activity.activity}
            subtitle={hasAddress ? activity.location.address : undefined}
            badge={hasTime ? activity.time : "Sin hora"}
            meta={
                hasDuration && (
                    <span className={styles.metaItem}>
                        <Clock3 size={13} className={styles.metaIcon} aria-hidden="true" />
                        <span className={styles.cardDuration}>{activity.duration}</span>
                    </span>
                )
            }
            isSelected={isSelected}
            onClick={onClick}
            ariaLabel={`${activity.activity} - ${activity.location.name}${hasAddress ? ` - ${activity.location.address}` : ""}${hasTime ? ` - ${activity.time}` : ""}`}
        />
    );
}
