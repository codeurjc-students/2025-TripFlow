import styles from "@styles/components/form/ItineraryEditForm.module.css";

import type { ExtendedItinerary } from "@/types/itinerary";

import BasicInfoSection from "@/components/dashboard/itineraries/BasicInfoSection";
import ItinerarySection from "@/components/dashboard/itineraries/ItinerarySection";

import { Trash2 } from "lucide-react";
import Button from "@/components/shared/Button";

interface ItineraryEditFormProps {
    itinerary: ExtendedItinerary;
    onUpdateBasicInfo: (field: keyof ExtendedItinerary, value: any) => void;
    onTagsChange: (newTags: string[]) => void;
    onDaysChange: (newDays: any[]) => void;
    onAddNewDay: () => void;
    onDelete?: () => void;
}

export default function ItineraryEditForm({
    itinerary,
    onUpdateBasicInfo,
    onTagsChange,
    onDaysChange,
    onAddNewDay,
    onDelete
}: ItineraryEditFormProps) {
    return (
        <div className={styles.editForm}>
            <BasicInfoSection
                itinerary={itinerary}
                onUpdateBasicInfo={onUpdateBasicInfo}
                onTagsChange={onTagsChange}
            />

            <ItinerarySection
                initialDate={itinerary.date}
                days={itinerary.days}
                onDaysChange={onDaysChange}
                onAddNewDay={onAddNewDay}
            />

            {onDelete && itinerary.permissions.delete && (
                <div className={styles.formFooter}>
                    <Button
                        onClick={onDelete}
                        style={["primary", "danger"]}
                        label="Eliminar Itinerario"
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>
            )}
        </div>
    );
}
