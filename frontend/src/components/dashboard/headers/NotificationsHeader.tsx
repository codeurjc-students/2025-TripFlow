import styles from "@styles/components/dashboard/headers/NotificationsHeader.module.css";

import { useState } from "react";
import { BellIcon, BellRingIcon, BellOffIcon } from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import Button from "@/components/shared/Button";

interface NotificationsHeaderProps {
    count: number;
}

export default function NotificationsHeader({ count }: NotificationsHeaderProps) {
    const { user, updateProfile } = useAuth();
    const [isToggling, setIsToggling] = useState(false);

    const displayCount = count > 99 ? "+99" : String(count);
    const notificationsEnabled = !!user?.notificationsAllowed;

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            await updateProfile({ notificationsAllowed: !notificationsEnabled });
        } catch {
            // Silently fail
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.bellWrapper}>
                    <BellIcon size={22} />
                    {count > 0 && (
                        <span className={styles.badge}>{displayCount}</span>
                    )}
                </div>
            </div>

            <h3 className={styles.title}>Notificaciones</h3>

            <div className={styles.right}>
                <Button
                    style={["tool_bordered"]}
                    onClick={handleToggle}
                    disabled={isToggling}
                    ariaLabel={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
                >
                    {notificationsEnabled ? <BellRingIcon size={20} /> : <BellOffIcon size={20} />}
                </Button>
            </div>
        </header>
    );
}
