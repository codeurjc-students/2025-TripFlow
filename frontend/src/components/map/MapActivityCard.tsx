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
    const title = typeof activity.activity === "string" && activity.activity.trim().length > 0
        ? activity.activity
        : "Actividad";
    const locationName = typeof activity.location.name === "string" && activity.location.name.trim().length > 0
        ? activity.location.name
        : "Ubicacion";
    const time = typeof activity.time === "string" ? activity.time.trim() : "";
    const duration = typeof activity.duration === "string" ? activity.duration.trim() : "";
    const address = typeof activity.location.address === "string" ? activity.location.address.trim() : "";
    const hasTime = time.length > 0;
    const hasDuration = duration.length > 0;
    const hasAddress = address.length > 0;

    return (
        <MapInfoCardBase
            title={title}
            subtitle={hasAddress ? address : undefined}
            badge={hasTime ? time : "Sin hora"}
            meta={
                hasDuration && (
                    <span className={styles.metaItem}>
                        <Clock3 size={13} className={styles.metaIcon} aria-hidden="true" />
                        <span className={styles.cardDuration}>{duration}</span>
                    </span>
                )
            }
            isSelected={isSelected}
            onClick={onClick}
            ariaLabel={`${title} - ${locationName}${hasAddress ? ` - ${address}` : ""}${hasTime ? ` - ${time}` : ""}`}
        />
    );
}
