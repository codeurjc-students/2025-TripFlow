import styles from "@styles/pages/Notifications.module.css";

import { CheckIcon, XIcon, UsersIcon } from "lucide-react";

import type { Collaborator } from "@/types/collaboration";

import Button from "@/components/shared/Button";
import Avatar from "@/components/shared/Avatar";
import { formatCollaboratorRole } from "@/utils/formatUtils";

function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return "hace 1d";
    return `hace ${diffDays}d`;
}

interface InvitationCardProps {
    invitation: Collaborator;
    isProcessing: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function InvitationCard({ invitation, isProcessing, onAccept, onDecline }: InvitationCardProps) {
    return (
        <div className={styles.card}>
            {/* Column 1: Avatar */}
            <div className={styles.avatarWrapper}>
                <Avatar username={invitation.user.username} />
                <div className={styles.iconBadge}>
                    <UsersIcon size={12} />
                </div>
            </div>

            {/* Column 2: Info */}
            <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>Invitación a viaje</span>
                <p className={styles.cardDescription}>
                    <strong>{invitation.fromUser}</strong> te ha invitado a unirte al viaje
                    '<strong>{invitation.itineraryTitle}</strong>' como {formatCollaboratorRole(invitation.role)}.
                </p>
            </div>

            {/* Column 3: Date + Actions */}
            <div className={styles.cardRight}>
                <div className={styles.cardMeta}>
                    <span className={styles.timeAgo}>{formatTimeAgo(invitation.invitedAt)}</span>
                    <div className={styles.unreadDot} />
                </div>
                <div className={styles.cardActions}>
                    <Button
                        style={["tool_bordered"]}
                        onClick={onAccept}
                        disabled={isProcessing}
                        ariaLabel="Aceptar invitación"
                    >
                        <CheckIcon size={18} />
                    </Button>
                    <Button
                        style={["tool_bordered", "danger"]}
                        onClick={onDecline}
                        disabled={isProcessing}
                        ariaLabel="Rechazar invitación"
                    >
                        <XIcon size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
