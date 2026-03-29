import styles from "@styles/components/map/MapInfoCardBase.module.css";

import type { ReactNode } from "react";

interface MapInfoCardBaseProps {
    title: string;
    subtitle?: ReactNode;
    badge?: ReactNode;
    meta?: ReactNode;
    isSelected: boolean;
    onClick: () => void;
    ariaLabel: string;
}

export default function MapInfoCardBase({
    title,
    subtitle,
    badge,
    meta,
    isSelected,
    onClick,
    ariaLabel,
}: MapInfoCardBaseProps) {
    return (
        <button
            className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-pressed={isSelected}
            type="button"
        >
            <div className={styles.cardContent}>
                <div className={styles.topRow}>
                    <span className={styles.cardTitle}>{title}</span>
                    {badge && <span className={styles.badge}>{badge}</span>}
                </div>

                {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}

                {meta && <div className={styles.metaRow}>{meta}</div>}
            </div>
        </button>
    );
}
