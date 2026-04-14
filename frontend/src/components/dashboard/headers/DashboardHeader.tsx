import styles from "@styles/components/dashboard/headers/DashboardHeader.module.css";

import { BellIcon } from "lucide-react";

import Button from "@/components/shared/Button";
import Avatar from "@/components/shared/Avatar";

interface DashboardHeaderProps {
    name?: string;
}

export default function DashboardHeader({ name } : DashboardHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Avatar to="/profile" />
                <h3 className={styles.title}>
                    <span className={styles.welcome}>Bienvenido,</span>
                    {name && <span className={styles.name}>{name}</span>}
                </h3>
            </div>
            <Button
                style={["tool_bordered"]}
                label="Notificaciones"
                to="/dashboard/notifications"
            >
                <BellIcon />
            </Button>
        </header>
    );
}
