import { useOffline } from "@/providers/offlineProvider";
import { useDemo } from "@/providers/demoProvider";

export function useOfflineMode() {
    const { isOnline, isOffline, lastOnlineAt } = useOffline();
    const { demo } = useDemo();

    const readOnly = isOffline && !demo;

    return {
        isOnline,
        isOffline,
        readOnly,
        lastOnlineAt,
        demo,
    };
}
