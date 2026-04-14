import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

import type { MapDirectionsProfile } from "@/types/map";
import type { MapSuggestion } from "@/types/map";
import type { EditableItineraryOption } from "@/hooks/useAddPoiToTrip";
import { useAddPoiToTrip } from "@/hooks/useAddPoiToTrip";
import { OfflineReadOnlyError } from "@/services/httpService";
import { buildExternalNavigationUrl } from "@/utils/mapNavigation";
import { useNotification } from "@/providers/notificationProvider";
import { retrieveFromLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";

interface UseMapExplorePoiActionsInput {
    places: MapSuggestion[];
    originCoords: { latitude: number; longitude: number } | null;
}

type AddFlowStep = "form" | "success";

function isDirectionsProfile(value: string): value is MapDirectionsProfile {
    return value === "DRIVING"
        || value === "DRIVING_TRAFFIC"
        || value === "WALKING"
        || value === "CYCLING";
}

function getPersistedProfile(): MapDirectionsProfile {
    const persisted = retrieveFromLocalStorage<string>(STORAGE_KEYS.ITINERARY_MAP_PROFILE_PREFIX);
    if (!persisted || !isDirectionsProfile(persisted)) {
        return "DRIVING";
    }

    return persisted;
}

export function useMapExplorePoiActions({ places, originCoords }: UseMapExplorePoiActionsInput) {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { isSubmitting, loadEditableItineraries, addPoiToTrip } = useAddPoiToTrip();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPoiForAdd, setSelectedPoiForAdd] = useState<MapSuggestion | null>(null);
    const [editableItineraries, setEditableItineraries] = useState<EditableItineraryOption[]>([]);
    const [isLoadingItineraries, setIsLoadingItineraries] = useState(false);
    const [lastAddedItineraryId, setLastAddedItineraryId] = useState<number | null>(null);
    const [addFlowStep, setAddFlowStep] = useState<AddFlowStep>("form");

    const navigateToPoi = useCallback((place: MapSuggestion | null) => {
        if (!place?.center) {
            notify("Este lugar no tiene coordenadas para navegar.", "info", { title: "Mapa" });
            return;
        }

        const profile = getPersistedProfile();
        const mapsUrl = buildExternalNavigationUrl(place, originCoords, profile);
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
        setAddFlowStep("form");
        setLastAddedItineraryId(null);
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
        setAddFlowStep("form");
        setLastAddedItineraryId(null);
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
            setLastAddedItineraryId(itineraryId);
            setAddFlowStep("success");
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

    const handleStayExploring = useCallback(() => {
        setIsAddModalOpen(false);
        setAddFlowStep("form");
        setLastAddedItineraryId(null);
        setSelectedPoiForAdd(null);
    }, []);

    const handleViewTrip = useCallback(() => {
        if (!lastAddedItineraryId) return;
        setIsAddModalOpen(false);
        setAddFlowStep("form");
        const itineraryId = lastAddedItineraryId;
        setLastAddedItineraryId(null);
        setSelectedPoiForAdd(null);
        navigate(`/itineraries/${itineraryId}`);
    }, [lastAddedItineraryId, navigate]);

    return {
        isSubmitting,
        isAddModalOpen,
        selectedPoiForAdd,
        editableItineraries,
        isLoadingItineraries,
        addFlowStep,
        lastAddedItineraryId,
        openAddToTripModal,
        closeAddModal,
        handleConfirmAdd,
        handleNavigateToPoi,
        handleModalNavigate,
        handleStayExploring,
        handleViewTrip,
    };
}
