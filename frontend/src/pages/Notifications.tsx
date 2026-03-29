import styles from "@styles/pages/Notifications.module.css";

import { MailOpenIcon } from "lucide-react";

import type { Collaborator } from "@/types/collaboration";

import { useNotifications } from "@/hooks/useNotifications";

import AppLayout from "@/layouts/AppLayout";
import InnerTabHeader from "@/components/dashboard/headers/InnerTabHeader";
import InvitationGroup from "@/components/dashboard/notifications/InvitationGroup";
import Loader from "@/components/shared/Loader";

interface GroupedInvitations {
    today: Collaborator[];
    yesterday: Collaborator[];
    older: Collaborator[];
}

function groupByDate(invitations: Collaborator[]): GroupedInvitations {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);

    const groups: GroupedInvitations = { today: [], yesterday: [], older: [] };

    for (const inv of invitations) {
        const invDate = new Date(inv.invitedAt);
        if (invDate >= todayStart) {
            groups.today.push(inv);
        } else if (invDate >= yesterdayStart) {
            groups.yesterday.push(inv);
        } else {
            groups.older.push(inv);
        }
    }

    return groups;
}

export default function NotificationsPage() {
    const {
        invitations,
        isLoading,
        processingIds,
        handleAccept,
        handleDecline,
    } = useNotifications();

    const grouped = groupByDate(invitations);

    return (
        <AppLayout innerPage>
            <InnerTabHeader
                title="Notificaciones"
                back={{
                    url: "/dashboard",
                    label: "Volver",
                }}
            />
            <div className={styles.container}>
                {isLoading ? (
                    <div className={styles.loaderContainer}>
                        <Loader size={32} variant="dots" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MailOpenIcon size={48} strokeWidth={1.5} />
                        <h3>Sin notificaciones</h3>
                        <p>No tienes invitaciones pendientes.</p>
                    </div>
                ) : (
                    <>
                        {grouped.today.length > 0 && (
                            <InvitationGroup
                                label="Hoy"
                                invitations={grouped.today}
                                processingIds={processingIds}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                            />
                        )}
                        {grouped.yesterday.length > 0 && (
                            <InvitationGroup
                                label="Ayer"
                                invitations={grouped.yesterday}
                                processingIds={processingIds}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                            />
                        )}
                        {grouped.older.length > 0 && (
                            <InvitationGroup
                                label="Anteriores"
                                invitations={grouped.older}
                                processingIds={processingIds}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                            />
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
