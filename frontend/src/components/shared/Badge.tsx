import styles from "@styles/components/shared/Badge.module.css";

import type { ItineraryStatus } from "@/types/itinerary";

import { formatStatus } from "@/utils/formatUtils";

type BadgeStyle = "thin" | "default" | "semi_thin" | "alpha" | "owner" | "editor" | "viewer";

interface BadgeProps {
    style: BadgeStyle[] | BadgeStyle;
    title?: string;
    children?: React.ReactNode;
    status?: ItineraryStatus;
    action?: React.ReactNode;
}

export default function Badge({
    title,
    children,
    style,
    status = "ONGOING",
    action
}: BadgeProps) {
    if (!title && !children) title = formatStatus(status);

    let customStyles = "";
    if (Array.isArray(style)) {
        style.map(s => customStyles += ` ${styles[s]}`);
    } else {
        customStyles = styles[style];
    }

    return (
        <span className={`${styles.badge} ${customStyles} ${styles[status.toLowerCase()]}`}>
            {title}
            {children}
            {action}
        </span>
    );
}
