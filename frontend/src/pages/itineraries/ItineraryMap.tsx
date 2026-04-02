import styles from "@styles/components/map/ItineraryMapPage.module.css";

import { Navigate, useParams } from "react-router";
import { useItineraryMapPage } from "@/hooks/useItineraryMapPage";
import { MAP_DIRECTIONS_PROFILE_OPTIONS } from "@/constants/mapDirectionsProfiles";

import {
    BikeIcon,
    CarIcon,
    CheckIcon,
    ChevronLeft,
    FootprintsIcon,
    LocateFixedIcon,
    TrafficConeIcon,
} from "lucide-react";

import ItineraryMarkersLayer from "@/components/map/ItineraryMarkersLayer";
import ItineraryRouteLayer from "@/components/map/ItineraryRouteLayer";
import MapBottomSheet from "@/components/map/MapBottomSheet";
import MapPageShell from "@/components/map/MapPageShell";
import Button from "@/components/shared/Button";
import ContextMenu from "@/components/shared/ContextMenu";
import Loader from "@/components/shared/Loader";
import AppLayout from "@/layouts/AppLayout";

function getDirectionsProfileIcon(profile: string) {
    if (profile === "WALKING") return <FootprintsIcon size={16} />;
    if (profile === "CYCLING") return <BikeIcon size={16} />;
    if (profile === "DRIVING_TRAFFIC") return <TrafficConeIcon size={16} />;
    return <CarIcon size={16} />;
}

export default function ItineraryMapPage() {
    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    const {
        itinerary,
        isLoading,
        mapData,
        directionsRoute,
        isRouteHidden,
        isBottomPanelCollapsed,
        directionsProfile,
        setDirectionsProfile,
        setMapInstance,
        recenter,
        handleMarkerClick,
        handleCardSelect,
        toggleBottomPanel,
    } = useItineraryMapPage(itineraryId);

    if (isLoading) {
        return (
            <div className={styles.loadingOverlay}>
                <Loader size={32} variant="dots" />
            </div>
        );
    }

    if (!itinerary) {
        return <Navigate to="/itineraries" />;
    }

    const selectedProfileLabel = MAP_DIRECTIONS_PROFILE_OPTIONS.find((option) => option.value === directionsProfile)?.label
        || "Coche";

    return (
        <AppLayout immersive innerPage>
            <MapPageShell
                className={styles.mapPage}
                mapClassName={styles.mapContainer}
                bounds={mapData.bounds}
                onMapReady={setMapInstance}
                renderLayers={(map) => (
                    <>
                        <ItineraryMarkersLayer
                            map={map}
                            waypoints={mapData.filteredWaypoints}
                            selectedIndex={mapData.selectedWaypointIndex}
                            onMarkerClick={handleMarkerClick}
                        />
                        <ItineraryRouteLayer
                            map={map}
                            path={directionsRoute.routePath}
                            isHidden={isRouteHidden}
                        />
                    </>
                )}
                topBar={(
                    <div className={styles.topBar}>
                        <div className={styles.topBarLeftGroup}>
                            <Button
                                style={["tool_bordered"]}
                                to={`/itineraries/${itineraryId}`}
                                ariaLabel="Volver al detalle del itinerario"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <ContextMenu
                                triggerStyle={["secondary"]}
                                trigger={(
                                    <span className={styles.routeModeTrigger}>
                                        {getDirectionsProfileIcon(directionsProfile)}
                                        {selectedProfileLabel}
                                    </span>
                                )}
                                items={MAP_DIRECTIONS_PROFILE_OPTIONS.map((option) => ({
                                    label: option.label,
                                    icon: option.value === directionsProfile
                                        ? <CheckIcon size={14} />
                                        : getDirectionsProfileIcon(option.value),
                                    onClick: () => setDirectionsProfile(option.value),
                                }))}
                            />
                        </div>
                        <Button
                            style={["tool_bordered"]}
                            onClick={recenter}
                            ariaLabel="Recentrar mapa"
                        >
                            <LocateFixedIcon size={18} />
                        </Button>
                    </div>
                )}
                bottomPanel={(
                    <MapBottomSheet
                        waypoints={mapData.filteredWaypoints}
                        dayNumbers={mapData.dayNumbers}
                        selectedDay={mapData.selectedDay}
                        onDayChange={mapData.setSelectedDay}
                        selectedWaypointIndex={mapData.selectedWaypointIndex}
                        onSelectWaypoint={handleCardSelect}
                        invalidCount={mapData.invalidCount}
                        itineraryTitle={itinerary.title}
                        isCollapsed={isBottomPanelCollapsed}
                        onToggleCollapse={toggleBottomPanel}
                        offsetForMobileNav={false}
                    />
                )}
            />
        </AppLayout>
    );
}
