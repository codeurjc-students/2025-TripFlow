import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface OfflineContextType {
    isOnline: boolean;
    isOffline: boolean;
    lastOnlineAt: number | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
    const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(() => (navigator.onLine ? Date.now() : null));

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setLastOnlineAt(Date.now());
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const value = useMemo(
        () => ({
            isOnline,
            isOffline: !isOnline,
            lastOnlineAt,
        }),
        [isOnline, lastOnlineAt]
    );

    return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error("useOffline must be used within OfflineProvider");
    }

    return context;
}
