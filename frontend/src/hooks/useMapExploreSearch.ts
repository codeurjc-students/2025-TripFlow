import { useCallback, useEffect, useState } from "react";

import type { MapSuggestion } from "@/types/map";
import { MAP_TOPIC_OPTIONS } from "@/constants/mapTopics";
import { suggestPlaces } from "@/services/mapsService";
import { useNotification } from "@/providers/notificationProvider";

interface UseMapExploreSearchInput {
    originCoords: { latitude: number; longitude: number } | null;
}

export function useMapExploreSearch({ originCoords }: UseMapExploreSearchInput) {
    const { notify } = useNotification();

    const [searchTerm, setSearchTerm] = useState("");
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
    const [radiusKm, setRadiusKm] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [places, setPlaces] = useState<MapSuggestion[]>([]);
    const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);

    const normalizedSearchTerm = searchTerm.trim();
    const hasActiveCriteria = Boolean(selectedTopicKey || normalizedSearchTerm.length > 0);

    const fetchSuggestions = useCallback(async (submittedSearch: string) => {
        if (!originCoords) {
            return;
        }

        const normalizedSubmittedSearch = submittedSearch.trim();
        const topic = MAP_TOPIC_OPTIONS.find((entry) => entry.key === selectedTopicKey);
        if (!topic && normalizedSubmittedSearch.length === 0) {
            return;
        }

        setIsLoading(true);

        try {
            const query = topic
                ? (normalizedSubmittedSearch.length > 0 ? `${topic.query} ${normalizedSubmittedSearch}` : topic.query)
                : normalizedSubmittedSearch;

            const response = await suggestPlaces({
                q: query,
                category: topic?.category,
                lat: originCoords.latitude,
                lon: originCoords.longitude,
                radiusKm,
                limit: 10,
            });

            setPlaces(response.suggestions.filter((suggestion) => suggestion.center !== null));
        } catch (error) {
            console.error("Error fetching map suggestions:", error);
            notify("No pudimos cargar recomendaciones cercanas.", "error", {
                title: "Mapa",
            });
            setPlaces([]);
        } finally {
            setIsLoading(false);
        }
    }, [notify, originCoords, radiusKm, selectedTopicKey]);

    useEffect(() => {
        if (!originCoords) {
            return;
        }

        const currentTerm = submittedSearchTerm.trim();
        if (!selectedTopicKey && currentTerm.length === 0) {
            return;
        }

        void fetchSuggestions(currentTerm);
    }, [fetchSuggestions, originCoords, selectedTopicKey, submittedSearchTerm]);

    const handleSubmitSearch = useCallback(() => {
        if (!hasActiveCriteria) {
            notify("Escribe una busqueda o selecciona un tema para iniciar.", "info", {
                title: "Mapa",
            });
            return;
        }

        const nextSubmittedSearch = searchTerm.trim();
        setSubmittedSearchTerm(nextSubmittedSearch);
        void fetchSuggestions(nextSubmittedSearch);
    }, [fetchSuggestions, hasActiveCriteria, notify, searchTerm]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
        setSubmittedSearchTerm("");
    }, []);

    const handleSelectTopic = useCallback((topicKey: string) => {
        setSelectedTopicKey((current) => {
            const next = current === topicKey ? null : topicKey;
            if (next === null) {
                setPlaces([]);
            }
            return next;
        });
    }, []);

    return {
        places,
        isLoading,
        radiusKm,
        selectedTopicKey,
        searchTerm,
        hasActiveCriteria,
        setSearchTerm,
        setRadiusKm,
        handleSubmitSearch,
        handleClearSearch,
        handleSelectTopic,
    };
}
