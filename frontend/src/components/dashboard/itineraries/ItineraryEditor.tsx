import { useCallback, useState } from "react";

import type { ExtendedItinerary } from "@/types/itinerary";

import { useItineraryForm } from "@/hooks/useItineraryForm";
import { useDayManager } from "@/hooks/useDayManager";
import { useNotification } from "@/providers/notificationProvider";
import { useModal } from "@/hooks/useModal";

import InnerTabHeader from "@/components/dashboard/headers/InnerTabHeader";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import Tabs from "@/components/shared/Tabs";
import ItineraryEditForm from "@/components/form/ItineraryEditForm";
import AIGeneration from "@/components/dashboard/ai/AIGeneration";

type ItineraryEditorType = "manual" | "ai" | "edit";

interface ItineraryEditorProps {
    initialItinerary: ExtendedItinerary;
    type: ItineraryEditorType;
    onSave: (itinerary: ExtendedItinerary) => Promise<void>;
    onDelete?: () => Promise<void>;
    back: {
        url: string;
        label: string;
    };
    isSaving?: boolean;
    readOnly?: boolean;
}

export default function ItineraryEditor({
    initialItinerary,
    type,
    onSave,
    onDelete,
    back,
    isSaving,
    readOnly = false,
}: ItineraryEditorProps) {
    let title = "";
    if (type === "edit") title = "Editar Itinerario";
    else title = "Nuevo Itinerario";

    const [activeTab, setActiveTab] = useState<ItineraryEditorType>(type);
    const { itinerary, updateBasicInfo, validateItinerary } = useItineraryForm(initialItinerary);
    const { notify } = useNotification();
    const { isOpen, openModal, closeModal } = useModal();

    // Day management operations
    const { handleAddNewDay } = useDayManager(
        itinerary.days,
        (newDays) => {
            updateBasicInfo('days', newDays);
        }
    );

    // Tags management
    const handleTagsChange = useCallback((newTags: string[]) => {
        updateBasicInfo('tags', newTags);
    }, [updateBasicInfo]);

    // Days management for itinerary section
    const handleDaysChange = useCallback((newDays: any[]) => {
        updateBasicInfo('days', newDays);
    }, [updateBasicInfo]);

    // Save functionality with validation
    const handleSave = useCallback(async () => {
        const validation = validateItinerary();

        if (!validation.isValid) {
            notify(validation.error as string, "error", { autoClose: true, title: "Revisa los campos" });
            return;
        }

        await onSave(itinerary);
    }, [itinerary, onSave, validateItinerary, notify]);

    const handleDelete = useCallback(async () => {
        if (onDelete) {
            await onDelete();
            closeModal();
        }
    }, [onDelete, closeModal]);

    return (
        <>
            <InnerTabHeader
                title={title}
                back={back}
                right={
                    activeTab !== "ai" ? (
                        <Button
                            onClick={handleSave}
                            style={["inline"]}
                            label={readOnly ? "Solo lectura" : isSaving ? "Guardando..." : "Guardar"}
                            disabled={isSaving || readOnly}
                        />
                    ) : undefined
                }
            />

            {type !== "edit" && (
                <Tabs
                    tabs={[
                        { id: 'manual', label: 'Manual' },
                        { id: 'ai', label: 'Asistente IA' }
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as ItineraryEditorType)}
                />
            )}

            {activeTab !== "ai" ? (
                <ItineraryEditForm
                    itinerary={itinerary}
                    onUpdateBasicInfo={updateBasicInfo}
                    onTagsChange={handleTagsChange}
                    onDaysChange={handleDaysChange}
                    onAddNewDay={handleAddNewDay}
                    onDelete={type === "edit" && !readOnly ? openModal : undefined}
                    readOnly={readOnly}
                />
            ) : (
                <AIGeneration />
            )}

            {type === "edit" && !readOnly && (
                <Modal
                    isOpen={isOpen}
                    title="Eliminar Itinerario"
                    message="¿Estás seguro de que deseas eliminar este itinerario? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    onConfirm={handleDelete}
                    onCancel={closeModal}
                    variant="danger"
                />
            )}
        </>
    );
}
