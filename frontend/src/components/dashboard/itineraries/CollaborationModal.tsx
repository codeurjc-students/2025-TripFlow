import styles from "@styles/components/dashboard/itineraries/CollaborationModal.module.css";

import { useEffect, useState } from "react";
import { 
    XIcon, 
    Trash2Icon, 
    SendIcon, 
    HourglassIcon, 
    LockIcon, 
    EyeIcon, 
    EditIcon, 
    NavigationOffIcon,
    LogOutIcon,
    LinkIcon,
    CopyIcon,
    BanIcon,
} from "lucide-react";

import { useNavigate } from "react-router";

import type { Collaborator, CollaboratorRole } from "@/types/collaboration";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useAuth } from "@/providers/authProvider";
import { useNotification } from "@/providers/notificationProvider";

import Button from "@components/shared/Button";
import Loader from "@components/shared/Loader";
import Avatar from "@/components/shared/Avatar";
import Badge from "@components/shared/Badge";
import ContextMenu from "@components/shared/ContextMenu";
import CustomSelect from "@components/shared/CustomSelect";
import { formatCollaboratorRole } from "@/utils/formatUtils";

interface CollaborationModalProps {
    isOpen: boolean;
    onClose: () => void;
    itineraryId: number;
}

/**
 * Modal for managing itinerary collaborators, including inviting new ones and changing roles.
 */
export default function CollaborationModal({
    isOpen,
    onClose,
    itineraryId,
}: CollaborationModalProps) {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [inviteUsername, setInviteUsername] = useState("");
    const [inviteRole, setInviteRole] = useState<CollaboratorRole>("VIEWER");

    const {
        collaborators,
        shareLinks,
        isLoading,
        isShareLinksLoading,
        inviteCollaborator,
        updateRole,
        removeCollaborator,
        leaveItinerary,
        generateShareLink,
        revokeShareLink,
        loadShareLinks,
    } = useCollaboration(itineraryId);

    const buildShareUrl = (token: string) => `${window.location.origin}/share/${token}`;

    const handleGenerateShareLink = async () => {
        const created = await generateShareLink();
        if (created?.token) {
            await handleCopyShareLink(created.token);
        }
    };

    const handleCopyShareLink = async (token: string) => {
        try {
            await navigator.clipboard.writeText(buildShareUrl(token));
            notify("Enlace copiado al portapapeles", "success");
        } catch {
            notify("No se pudo copiar el enlace", "error");
        }
    };

    const handleLeave = async () => {
        if (!user) return;
        const success = await leaveItinerary(user.username);
        if (success) {
            onClose();
            navigate("/itineraries");
        }
    };

    const currentOwner = collaborators?.find((c) => c.role === "OWNER");
    const isOwner = user?.username === currentOwner?.user.username;

    useEffect(() => {
        if (!isOpen || !isOwner) return;
        loadShareLinks();
    }, [isOpen, isOwner, loadShareLinks]);

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inviteUsername.trim();
        if (!trimmed) return;

        const success = await inviteCollaborator(trimmed, inviteRole);
        if (success) {
            setInviteUsername("");
            setInviteRole("VIEWER");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.header}>
                    <h2 className={styles.title}>Colaboradores</h2>
                    <Button style={["tool_bordered"]} onClick={onClose} ariaLabel="Cerrar modal">
                        <XIcon size={20} />
                    </Button>
                </header>

                {/* Body */}
                <main className={styles.body}>
                    {isOwner && (
                        <>
                            <section className={styles.inviteSection}>
                                <span className={styles.sectionTitle}>Invitar usuario</span>
                                <form className={styles.inviteForm} onSubmit={handleInvite}>
                                    <input
                                        type="text"
                                        className={styles.inviteInput}
                                        placeholder="Nombre de usuario"
                                        value={inviteUsername}
                                        onChange={(e) => setInviteUsername(e.target.value)}
                                        aria-label="Nombre de usuario para invitar"
                                    />
                                    <div className={styles.inviteActions}>
                                        <CustomSelect
                                            className={styles.roleSelect}
                                            value={inviteRole}
                                            onChange={(val) => setInviteRole(val as CollaboratorRole)}
                                            options={[
                                                { label: formatCollaboratorRole("VIEWER"), value: "VIEWER" },
                                                { label: formatCollaboratorRole("EDITOR"), value: "EDITOR" }
                                            ]}
                                        />
                                        <Button
                                            type="submit"
                                            label="Invitar"
                                            style={["secondary"]}
                                            ariaLabel="Enviar invitación"
                                            disabled={!inviteUsername.trim()}
                                        >
                                            <SendIcon size={16} strokeWidth={2} />
                                        </Button>
                                    </div>
                                </form>
                            </section>

                            <div className={styles.divider} />

                            <section className={styles.shareSection}>
                                <span className={styles.sectionTitle}>Compartir enlace</span>
                                <Button
                                    style={["secondary"]}
                                    label="Generar enlace"
                                    onClick={handleGenerateShareLink}
                                    ariaLabel="Generar enlace para compartir"
                                >
                                    <LinkIcon size={16} strokeWidth={2} />
                                </Button>

                                <div className={styles.shareLinksList}>
                                    {isShareLinksLoading ? (
                                        <Loader size={20} variant="dots" />
                                    ) : shareLinks.length === 0 ? (
                                        <p className={styles.shareEmpty}>Sin enlaces activos</p>
                                    ) : (
                                        shareLinks.map((shareLink) => (
                                            <div key={shareLink.id} className={styles.shareLinkItem}>
                                                <div className={styles.shareInfo}>
                                                    <span className={styles.shareUrl}>{buildShareUrl(shareLink.token)}</span>
                                                    <span className={styles.shareExpiry}>
                                                        Expira: {new Date(shareLink.expiresAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className={styles.shareActions}>
                                                    <Button
                                                        style={["tool_bordered"]}
                                                        onClick={() => handleCopyShareLink(shareLink.token)}
                                                        ariaLabel="Copiar enlace compartido"
                                                    >
                                                        <CopyIcon size={16} />
                                                    </Button>
                                                    <Button
                                                        style={["tool_bordered", "danger"]}
                                                        onClick={() => revokeShareLink(shareLink.id)}
                                                        ariaLabel="Revocar enlace compartido"
                                                    >
                                                        <BanIcon size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <div className={styles.divider} />
                        </>
                    )}

                    {/* Collaborator List */}
                    <div className={styles.listContainer}>
                        {isLoading ? (
                            <Loader size={24} variant="dots" />
                        ) : collaborators.length === 0 ? (
                            <p className={styles.emptyState}>
                                {isOwner
                                    ? "No hay colaboradores en este itinerario. ¡Invita a alguien!"
                                    : "No hay colaboradores en este itinerario."
                                }
                            </p>
                        ) : (
                            <div className={styles.collaboratorList}>
                                <span className={styles.sectionTitle}>Compañeros</span>
                                {collaborators.map((collaborator) => (
                                    <CollaboratorListItem
                                        key={collaborator.id}
                                        collaborator={collaborator}
                                        isOwner={isOwner}
                                        currentUserId={user?.username}
                                        onUpdateRole={updateRole}
                                        onRemove={removeCollaborator}
                                        onLeave={handleLeave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

interface CollaboratorListItemProps {
    collaborator: Collaborator;
    isOwner: boolean;
    currentUserId?: string;
    onUpdateRole: (username: string, role: CollaboratorRole) => Promise<boolean>;
    onRemove: (username: string) => Promise<boolean>;
    onLeave: () => void;
}

function CollaboratorListItem({
    collaborator,
    isOwner,
    currentUserId,
    onUpdateRole,
    onRemove,
    onLeave,
}: CollaboratorListItemProps) {
    const isCurrentUser = collaborator.user.username === currentUserId;
    const isPending = collaborator.status === "PENDING";

    return (
        <div className={`${styles.collaboratorItem} ${isPending ? styles.pending : ""}`}>
            <div className={styles.itemLeft}>
                {isPending ? (
                    <div className={`${styles.collaboratorAvatar} ${styles.pendingAvatar}`}>
                        <HourglassIcon size={20} />
                    </div>
                ) : (
                    <Avatar username={collaborator.user.username} />
                )}

                <div className={styles.collaboratorInfo}>
                    <div className={styles.collaboratorName}>
                        {collaborator.user.name || collaborator.user.username}
                        {isCurrentUser && " (Tú)"}
                    </div>
                    <div className={`${styles.collaboratorUsername} ${isPending ? styles.italic : ""}`}>
                        {isPending ? "Invitación enviada..." : `@${collaborator.user.username}`}
                    </div>
                </div>
            </div>

            <div className={styles.itemRight}>
                {collaborator.role === "OWNER" ? (
                    <>
                        <Badge style={["thin", "owner"]} title={formatCollaboratorRole(collaborator.role)} />
                        {isOwner && (
                            <Button style={["tool_bordered"]} disabled>
                                <LockIcon size={16} strokeWidth={2.5} />
                            </Button>
                        )}
                    </>
                ) : !isOwner ? (
                    <>
                        <Badge style={["thin", collaborator.role.toLowerCase() as any]} title={formatCollaboratorRole(collaborator.role)} />
                        {isCurrentUser && collaborator.status === "ACCEPTED" && (
                            <Button
                                style={["tool_bordered", "danger"]}
                                onClick={onLeave}
                                ariaLabel="Abandonar itinerario"
                            >
                                <LogOutIcon size={16} />
                            </Button>
                        )}
                    </>
                ) : isPending ? (
                    <Button
                        style={["tool_bordered", "danger"]}
                        onClick={() => onRemove(collaborator.user.username)}
                        ariaLabel="Cancelar invitación"
                    >
                        <NavigationOffIcon size={16} />
                    </Button>
                ) : (
                    <>
                        <Badge
                            style={["thin", collaborator.role.toLowerCase() as any]}
                            title={formatCollaboratorRole(collaborator.role)}
                        />
                        {isOwner && (
                            <ContextMenu
                                items={[
                                    collaborator.role === "VIEWER" ? {
                                        label: "Hacer Editor",
                                        icon: <EditIcon size={16} />,
                                        onClick: () => onUpdateRole(collaborator.user.username, "EDITOR")
                                    } : {
                                        label: "Hacer Lector",
                                        icon: <EyeIcon size={16} />,
                                        onClick: () => onUpdateRole(collaborator.user.username, "VIEWER")
                                    },
                                    {
                                        label: "Eliminar",
                                        danger: true,
                                        icon: <Trash2Icon size={16} />,
                                        onClick: () => onRemove(collaborator.user.username)
                                    }
                                ]}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
