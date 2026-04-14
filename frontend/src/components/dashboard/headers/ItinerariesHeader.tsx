import styles from "@styles/components/dashboard/headers/ItinerariesHeader.module.css";

import { PlusIcon } from "lucide-react";

import Button from "@/components/shared/Button";
import { useOfflineMode } from "@/hooks/useOfflineMode";

interface ItinerariesHeaderProps {
    children: React.ReactNode;
}

export default function ItinerariesHeader({ children } : ItinerariesHeaderProps) {
    const { readOnly } = useOfflineMode();

    return (
        <header className={styles.header}>
            {children}
            {!readOnly && (
                <Button
                    style={["tool_bordered"]}
                    label="Crear itinerario"
                    to="/itineraries/new"
                ><PlusIcon /></Button>
            )}
        </header>
    );
}