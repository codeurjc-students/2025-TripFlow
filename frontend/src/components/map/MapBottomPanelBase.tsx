import styles from "@styles/components/map/MapBottomPanelBase.module.css";

import type { ReactNode } from "react";

import MapPanelHeader from "@/components/map/MapPanelHeader";

interface MapBottomPanelBaseProps {
    title: ReactNode;
    subtitle?: ReactNode;
    ariaLabel: string;
    children: ReactNode;
    isCollapsed: boolean;
    onToggle: () => void;
    offsetForMobileNav?: boolean;
}

export default function MapBottomPanelBase({
    title,
    subtitle,
    ariaLabel,
    children,
    isCollapsed,
    onToggle,
    offsetForMobileNav = true,
}: MapBottomPanelBaseProps) {
    return (
        <section
            className={`${styles.panel} ${offsetForMobileNav ? styles.offsetForMobileNav : styles.flushOnMobile}`}
            role="region"
            aria-label={ariaLabel}
        >
            <MapPanelHeader
                title={title}
                subtitle={subtitle}
                isCollapsed={isCollapsed}
                onToggle={onToggle}
                containerClassName={`${styles.headerRow} ${isCollapsed ? styles.headerRowCollapsed : ""}`}
                textContainerClassName={styles.headerText}
                titleClassName={styles.title}
                subtitleClassName={subtitle ? styles.subtitle : undefined}
            />

            <div className={`${styles.content} ${isCollapsed ? styles.contentCollapsed : ""}`}>
                {children}
            </div>
        </section>
    );
}
