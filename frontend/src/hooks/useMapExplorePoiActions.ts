import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

import type { MapSuggestion } from "@/types/map";
import type { EditableItineraryOption } from "@/hooks/useAddPoiToTrip";
import { useAddPoiToTrip } from "@/hooks/useAddPoiToTrip";
import { OfflineReadOnlyError } from "@/services/httpService";
import { buildExternalNavigationUrl } from "@/utils/mapNavigation";
import { useNotification } from "@/providers/notificationProvider";

interface UseMapExplorePoiActionsInput {
    places: MapSuggestion[];
    originCoords: { latitude: number; longitude: number } | null;
}

export function useMapExplorePoiActions({ places, originCoords }: UseMapExplorePoiActionsInput) {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { isSubmitting, loadEditableItineraries, addPoiToTrip } = useAddPoiToTrip();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPoiForAdd, setSelectedPoiForAdd] = useState<MapSuggestion | null>(null);
    const [editableItineraries, setEditableItineraries] = useState<EditableItineraryOption[]>([]);
    const [isLoadingItineraries, setIsLoadingItineraries] = useState(false);

    const navigateToPoi = useCallback((place: MapSuggestion | null) => {
        if (!place?.center) {
            notify("Este lugar no tiene coordenadas para navegar.", "info", { title: "Mapa" });
            return;
        }

        const mapsUrl = buildExternalNavigationUrl(place, originCoords);
        if (!mapsUrl) {
            notify("Este lugar no tiene coordenadas para navegar.", "info", { title: "Mapa" });
            return;
        }

        window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }, [notify, originCoords]);

    const handleNavigateToPoi = useCallback((index: number) => {
        navigateToPoi(places[index] ?? null);
    }, [navigateToPoi, places]);

    const openAddToTripModal = useCallback(async (index: number) => {
        const place = places[index];
        if (!place || !place.center) {
            notify("Este lugar no tiene coordenadas validas.", "info", { title: "Mapa" });
            return;
        }

        setSelectedPoiForAdd(place);
        setIsAddModalOpen(true);
        setIsLoadingItineraries(true);

        try {
            const options = await loadEditableItineraries();
            setEditableItineraries(options);
        } catch {
            notify("No pudimos cargar tus viajes editables.", "error", { title: "Mapa" });
            setEditableItineraries([]);
        } finally {
            setIsLoadingItineraries(false);
        }
    }, [loadEditableItineraries, notify, places]);

    const closeAddModal = useCallback(() => {
        setIsAddModalOpen(false);
        setSelectedPoiForAdd(null);
    }, []);

    const handleConfirmAdd = useCallback(async ({ itineraryId, dayNumber, time, duration }: {
        itineraryId: number;
        dayNumber: number;
        time?: string;
        duration?: string;
    }) => {
        if (!selectedPoiForAdd) return;

        try {
            await addPoiToTrip({
                poi: selectedPoiForAdd,
                itineraryId,
                dayNumber,
                time,
                duration,
            });

            notify("Lugar agregado al viaje correctamente.", "success", { title: "Mapa" });
            setIsAddModalOpen(false);
            setSelectedPoiForAdd(null);
            navigate(`/itineraries/${itineraryId}`);
        } catch (error) {
            if (error instanceof OfflineReadOnlyError) {
                notify("Sin conexion: no puedes agregar lugares al viaje.", "info", { title: "Modo offline" });
                return;
            }

            notify("No pudimos agregar este lugar al viaje.", "error", { title: "Mapa" });
        }
    }, [addPoiToTrip, navigate, notify, selectedPoiForAdd]);

    const handleModalNavigate = useCallback(() => {
        navigateToPoi(selectedPoiForAdd);
    }, [navigateToPoi, selectedPoiForAdd]);

    return {
        isSubmitting,
        isAddModalOpen,
        selectedPoiForAdd,
        editableItineraries,
        isLoadingItineraries,
        openAddToTripModal,
        closeAddModal,
        handleConfirmAdd,
        handleNavigateToPoi,
        handleModalNavigate,
    };
}
