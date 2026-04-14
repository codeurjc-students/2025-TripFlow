import type { ReactNode } from "react";

import MapPanelToggle from "@/components/map/MapPanelToggle";

interface MapPanelHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    isCollapsed: boolean;
    onToggle: () => void;
    containerClassName: string;
    textContainerClassName: string;
    titleClassName: string;
    subtitleClassName?: string;
}

export default function MapPanelHeader({
    title,
    subtitle,
    isCollapsed,
    onToggle,
    containerClassName,
    textContainerClassName,
    titleClassName,
    subtitleClassName,
}: MapPanelHeaderProps) {
    return (
        <div className={containerClassName}>
            <div className={textContainerClassName}>
                <h3 className={titleClassName}>{title}</h3>
                {subtitle && subtitleClassName && <p className={subtitleClassName}>{subtitle}</p>}
            </div>
            <MapPanelToggle isCollapsed={isCollapsed} onToggle={onToggle} />
        </div>
    );
}
