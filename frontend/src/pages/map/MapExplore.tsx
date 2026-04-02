import styles from "@styles/pages/MapExplore.module.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LocateFixedIcon } from "lucide-react";
import type L from "leaflet";

import { MAP_TOPIC_OPTIONS } from "@/constants/mapTopics";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMapExploreSearch } from "@/hooks/useMapExploreSearch";
import { useMapExplorePoiActions } from "@/hooks/useMapExplorePoiActions";
import { useNotification } from "@/providers/notificationProvider";

import AppLayout from "@/layouts/AppLayout";
import MapPageShell from "@/components/map/MapPageShell";
import ExploreMarkersLayer from "@/components/map/ExploreMarkersLayer";
import CurrentLocationLayer from "@/components/map/CurrentLocationLayer";
import NearbyResultsSheet from "@/components/map/NearbyResultsSheet";
import AddPoiToTripModal from "@/components/map/AddPoiToTripModal";
import Button from "@/components/shared/Button";
import Searchbar from "@/components/shared/Searchbar";

const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038];
export default function MapExplorePage() {
    const { notify } = useNotification();
    const geolocation = useGeolocation();

    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);

    const activeOriginCoords = geolocation.coords;

    const {
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
    } = useMapExploreSearch({ originCoords: activeOriginCoords });

    const {
        isSubmitting,
        isAddModalOpen,
        selectedPoiForAdd,
        editableItineraries,
        isLoadingItineraries,
        addFlowStep,
        openAddToTripModal,
        closeAddModal,
        handleConfirmAdd,
        handleNavigateToPoi,
        handleModalNavigate,
        handleStayExploring,
        handleViewTrip,
    } = useMapExplorePoiActions({ places, originCoords: activeOriginCoords });

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

    useEffect(() => {
        setSelectedIndex(null);
    }, [places]);

    const handleRecenter = useCallback(() => {
        if (!mapInstance) {
            return;
        }

        mapInstance.flyTo(center, 14, {
            animate: true,
            duration: 0.5,
        });
    }, [mapInstance, center]);

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
                            onAddToTrip={openAddToTripModal}
                            onNavigate={handleNavigateToPoi}
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

            <AddPoiToTripModal
                isOpen={isAddModalOpen}
                poi={selectedPoiForAdd}
                itineraries={editableItineraries}
                isLoadingItineraries={isLoadingItineraries}
                isSubmitting={isSubmitting}
                flowStep={addFlowStep}
                onClose={closeAddModal}
                onConfirmAdd={handleConfirmAdd}
                onNavigate={handleModalNavigate}
                onStayExploring={handleStayExploring}
                onViewTrip={handleViewTrip}
            />
        </AppLayout>
    );
}
