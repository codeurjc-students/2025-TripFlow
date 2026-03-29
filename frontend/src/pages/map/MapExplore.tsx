import styles from "@styles/pages/MapExplore.module.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LocateFixedIcon } from "lucide-react";
import type L from "leaflet";

import type { MapSuggestion } from "@/types/map";
import { MAP_TOPIC_OPTIONS } from "@/constants/mapTopics";
import { suggestPlaces } from "@/services/mapsService";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNotification } from "@/providers/notificationProvider";

import AppLayout from "@/layouts/AppLayout";
import MapPageShell from "@/components/map/MapPageShell";
import ExploreMarkersLayer from "@/components/map/ExploreMarkersLayer";
import CurrentLocationLayer from "@/components/map/CurrentLocationLayer";
import NearbyResultsSheet from "@/components/map/NearbyResultsSheet";
import Button from "@/components/shared/Button";
import Searchbar from "@/components/shared/Searchbar";

const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038];
export default function MapExplorePage() {
    const { notify } = useNotification();
    const geolocation = useGeolocation();

    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
    const [radiusKm, setRadiusKm] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [places, setPlaces] = useState<MapSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);
    const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);

    const normalizedSearchTerm = searchTerm.trim();
    const hasActiveCriteria = Boolean(selectedTopicKey || normalizedSearchTerm.length > 0);

    const activeOriginCoords = geolocation.coords;

    const center = useMemo<[number, number]>(() => {
        if (!activeOriginCoords) {
            return DEFAULT_CENTER;
        }
        return [activeOriginCoords.latitude, activeOriginCoords.longitude];
    }, [activeOriginCoords]);

    useEffect(() => {
        geolocation.request();
    }, [geolocation.request]);

    useEffect(() => {
        if (geolocation.status === "denied") {
            notify("Activa permisos de ubicacion para recomendaciones alrededor tuyo.", "info", {
                title: "Permiso requerido",
            });
        }
    }, [geolocation.status, notify]);

    const fetchSuggestions = useCallback(async (submittedSearch: string) => {
        if (!activeOriginCoords) {
            return;
        }

        const normalizedSubmittedSearch = submittedSearch.trim();
        const topic = MAP_TOPIC_OPTIONS.find((entry) => entry.key === selectedTopicKey);
        if (!topic && normalizedSubmittedSearch.length === 0) {
            return;
        }

        setIsLoading(true);
        setSelectedIndex(null);

        try {
            const query = topic
                ? (normalizedSubmittedSearch.length > 0 ? `${topic.query} ${normalizedSubmittedSearch}` : topic.query)
                : normalizedSubmittedSearch;

            const response = await suggestPlaces({
                q: query,
                category: topic?.category,
                lat: activeOriginCoords.latitude,
                lon: activeOriginCoords.longitude,
                radiusKm,
                limit: 10
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
    }, [activeOriginCoords, selectedTopicKey, radiusKm, notify]);

    useEffect(() => {
        if (!activeOriginCoords) {
            return;
        }
        const currentTerm = submittedSearchTerm.trim();
        if (!selectedTopicKey && currentTerm.length === 0) {
            return;
        }
        void fetchSuggestions(currentTerm);
    }, [radiusKm, selectedTopicKey, activeOriginCoords, fetchSuggestions]);

    useEffect(() => {
        if (!mapInstance || !activeOriginCoords) {
            return;
        }

        mapInstance.flyTo([activeOriginCoords.latitude, activeOriginCoords.longitude], 14, {
            animate: true,
            duration: 0.6,
        });
    }, [mapInstance, activeOriginCoords]);

    const handleSelectPlace = useCallback((index: number) => {
        setSelectedIndex(index);
        const place = places[index];
        if (!place?.center || !mapInstance) {
            return;
        }

        mapInstance.flyTo([place.center.latitude, place.center.longitude], 15, {
            animate: true,
            duration: 0.5,
        });
    }, [places, mapInstance]);

    const handleRecenter = useCallback(() => {
        if (!mapInstance) {
            return;
        }

        mapInstance.flyTo(center, 14, {
            animate: true,
            duration: 0.5,
        });
    }, [mapInstance, center]);

    const handleSubmitSearch = useCallback(() => {
        if (!hasActiveCriteria) {
            notify("Escribe una búsqueda o selecciona un tema para iniciar.", "info", {
                title: "Mapa",
            });
            return;
        }
        const nextSubmittedSearch = searchTerm.trim();
        setSubmittedSearchTerm(nextSubmittedSearch);
        void fetchSuggestions(nextSubmittedSearch);
    }, [hasActiveCriteria, notify, fetchSuggestions, searchTerm]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
        setSubmittedSearchTerm("");
    }, []);

    const handleSelectTopic = useCallback((topicKey: string) => {
        setSelectedTopicKey((current) => {
            const next = current === topicKey ? null : topicKey;
            if (next === null) {
                setPlaces([]);
                setSelectedIndex(null);
            }
            return next;
        });
    }, []);

    return (
        <AppLayout immersive>
            <MapPageShell
                className={styles.page}
                mapClassName={styles.mapContainer}
                bounds={null}
                onMapReady={setMapInstance}
                renderLayers={(map) => (
                    <>
                        {geolocation.coords && (
                            <CurrentLocationLayer
                                map={map}
                                latitude={geolocation.coords.latitude}
                                longitude={geolocation.coords.longitude}
                            />
                        )}
                        <ExploreMarkersLayer
                            map={map}
                            places={places}
                            selectedIndex={selectedIndex}
                            onSelect={handleSelectPlace}
                            userCoords={activeOriginCoords}
                        />
                    </>
                )}
                topBar={(
                    <div className={styles.topBarStack}>
                        <div className={styles.topBar}>
                            <div className={styles.topBarLeft}>
                                <Searchbar
                                    placeHolder="Buscar cafes, museos, parques..."
                                    value={searchTerm}
                                    onInputChange={setSearchTerm}
                                    onSearch={handleSubmitSearch}
                                    onClear={handleClearSearch}
                                    ariaLabel="Buscar lugares cercanos"
                                />
                                <div className={styles.topicRow}>
                                    {MAP_TOPIC_OPTIONS.map((topic) => (
                                        <button
                                            key={topic.key}
                                            type="button"
                                            className={`${styles.topicChip} ${selectedTopicKey === topic.key ? styles.topicChipActive : ""}`}
                                            onClick={() => handleSelectTopic(topic.key)}
                                        >
                                            {topic.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button
                                style={["tool_bordered"]}
                                onClick={handleRecenter}
                                ariaLabel="Recentrar en mi ubicacion"
                            >
                                <LocateFixedIcon size={18} />
                            </Button>
                        </div>
                    </div>
                )}
                bottomPanel={(
                    <NearbyResultsSheet
                        places={places}
                        isLoading={isLoading}
                        selectedIndex={selectedIndex}
                        onSelect={handleSelectPlace}
                        selectedRadiusKm={radiusKm}
                        onRadiusChange={setRadiusKm}
                        isCollapsed={isBottomPanelCollapsed}
                        onToggleCollapse={() => setIsBottomPanelCollapsed((value) => !value)}
                        userCoords={activeOriginCoords}
                        hasActiveCriteria={hasActiveCriteria}
                    />
                )}
            />
        </AppLayout>
    );
}
