import styles from "@styles/pages/Notifications.module.css";

import type { Collaborator } from "@/types/collaboration";
import InvitationCard from "./InvitationCard";

interface InvitationGroupProps {
    label: string;
    invitations: Collaborator[];
    processingIds: Set<number>;
    onAccept: (invitation: Collaborator) => void;
    onDecline: (invitation: Collaborator) => void;
}

export default function InvitationGroup({ label, invitations, processingIds, onAccept, onDecline }: InvitationGroupProps) {
    return (
        <section className={styles.group}>
            <span className={styles.groupLabel}>{label}</span>
            <div className={styles.invitationList}>
                {invitations.map((invitation) => (
                    <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        isProcessing={processingIds.has(invitation.id)}
                        onAccept={() => onAccept(invitation)}
                        onDecline={() => onDecline(invitation)}
                    />
                ))}
            </div>
        </section>
    );
}
