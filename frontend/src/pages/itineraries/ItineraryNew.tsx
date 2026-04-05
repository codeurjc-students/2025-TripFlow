import { useNavigate, useSearchParams } from "react-router";
import { useState } from "react";

import { useNotification } from "@/providers/notificationProvider";
import { createDefaultItinerary } from "@/hooks/useItineraryForm";

import type { ExtendedItinerary } from "@/types/itinerary";

import { createItinerary } from "@/services/itineraryService";
import { OfflineReadOnlyError } from "@/services/httpService";
import { useOfflineMode } from "@/hooks/useOfflineMode";

import AppLayout from "@/layouts/AppLayout";
import ItineraryEditor from "@/components/dashboard/itineraries/ItineraryEditor";

export default function ItineraryNewPage() {
    const [isSaving, setIsSaving] = useState(false);

    const { notify } = useNotification();
    const navigate = useNavigate();
    const { readOnly } = useOfflineMode();

    const [searchParams] = useSearchParams();
    const editorType = searchParams.get("editorType") === "ai"
        ? "ai"
        : "manual";

    const handleSave = async (itinerary: ExtendedItinerary) => {
        setIsSaving(true);
        try {
            const res = await createItinerary(itinerary);

            if (!res || !res.id) {
                notify("Ha ocurrido un error al crear el itinerario.", "error", {
                    title: "Error",
                    duration: 5000
                });
                return;
            }

            notify("Itinerario creado correctamente.", "success", {
                title: "Éxito",
            });
            navigate(`/itineraries/${res.id}`);
        } catch (error) {
            if (error instanceof OfflineReadOnlyError) {
                notify("Sin conexión: no puedes crear itinerarios en modo offline.", "info", {
                    title: "Modo offline",
                });
                navigate("/itineraries");
                return;
            }

            notify("Ha ocurrido un error al crear el itinerario.", "error", {
                title: "Error",
                duration: 5000
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout innerPage>
            <ItineraryEditor
                key={editorType}
                type={editorType}
                initialItinerary={createDefaultItinerary()}
                onSave={handleSave}
                isSaving={isSaving}
                readOnly={readOnly}
                back={{ url: "/itineraries/", label: "Cancelar" }}
            />
        </AppLayout>
    );
}
