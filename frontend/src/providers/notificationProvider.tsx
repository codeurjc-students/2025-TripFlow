import styles from "@styles/components/shared/Notification.module.css";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import { generateId } from "@/utils/generateId";
import { useAuth } from "@/providers/authProvider";

import NotificationRender, { type NotificationRendererType } from "@/components/shared/Notification";

interface NotificationOptions {
    autoClose?: boolean;
    duration?: number;
    title?: string;
}

interface InternalNotification {
    id: string;
    type: NotificationRendererType;
    message: string;
    options?: NotificationOptions;
    isClosing?: boolean;
}

interface NotificationContextType {
    notify: (message: string, type: NotificationRendererType, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notify: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<InternalNotification[]>([]);
    const { user } = useAuth();

    const notify = useCallback((
        message: string,
        type: NotificationRendererType,
        options?: NotificationOptions
    ) => {
        if (user && !user.notificationsAllowed) {
            setNotifications([]);
            return;
        }

        const defaultOptions = { autoClose: true, duration: 3000, title: "Notificación" };
        const finalOptions = { ...defaultOptions, ...options };

        const id = generateId();
        const newNotification: InternalNotification = { id, type, message, options: finalOptions };

        setNotifications((prev) => [...prev, newNotification]);

        if (finalOptions.autoClose) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, finalOptions.duration);
        }
    }, [user]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isClosing: true } : n))
        );
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className={styles.notificationContainer}>
                {notifications.map((notification) => (
                    <NotificationRender
                        key={notification.id}
                        type={notification.type}
                        title={notification.options?.title}
                        message={notification.message}
                        onClose={() => removeNotification(notification.id)}
                        isClosing={notification.isClosing}
                        onExited={() => deleteNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}