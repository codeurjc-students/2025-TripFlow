import styles from "@styles/components/map/ItineraryMapPage.module.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router";
import type L from "leaflet";

import type { ExtendedItinerary } from "@/types/itinerary";
import { getItineraryById } from "@/services/itineraryService";
import { useItineraryMapData } from "@/hooks/useItineraryMapData";
import { FIT_BOUNDS_PADDING } from "@/utils/mapGeometry";

import { ChevronLeft, LocateFixedIcon } from "lucide-react";

import LeafletMapView, { useRecenter } from "@/components/map/LeafletMapView";
import ItineraryMarkersLayer from "@/components/map/ItineraryMarkersLayer";
import ItineraryRouteLayer from "@/components/map/ItineraryRouteLayer";
import MapBottomSheet from "@/components/map/MapBottomSheet";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";

export default function ItineraryMapPage() {
    const [itinerary, setItinerary] = useState<ExtendedItinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [isRouteHidden, setIsRouteHidden] = useState(false);

    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    const mapData = useItineraryMapData(itinerary);
    const recenter = useRecenter(mapInstance, mapData.bounds);
    const prevSelectedDayRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchItinerary = async () => {
            setIsLoading(true);
            try {
                const data = await getItineraryById(itineraryId);
                setItinerary(data);
            } catch {
                setItinerary(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItinerary();
    }, [id]);

    const handleMapReady = useCallback((map: L.Map) => {
        setMapInstance(map);
    }, []);

    const handleMarkerClick = useCallback((index: number) => {
        mapData.selectWaypoint(index);
    }, [mapData.selectWaypoint]);

    const handleCardSelect = useCallback((index: number | null) => {
        mapData.selectWaypoint(index);
        if (index !== null && mapData.filteredWaypoints[index] && mapInstance) {
            const zoom = mapInstance.getZoom();
            const size = mapInstance.getSize();
            const isMobile = size.x <= 768;
            const offsetY = Math.round(size.y * (isMobile ? 0.25 : 0.15));
            const targetPoint = mapInstance.project(mapData.filteredWaypoints[index].position, zoom);
            const offsetPoint = targetPoint.add([0, offsetY]);
            const offsetLatLng = mapInstance.unproject(offsetPoint, zoom);

            setIsRouteHidden(true);
            mapInstance.once("moveend", () => setIsRouteHidden(false));

            mapInstance.flyTo(offsetLatLng, zoom, {
                animate: true,
                duration: 0.45,
            });
        }
    }, [mapData.selectWaypoint, mapData.filteredWaypoints, mapInstance]);

    useEffect(() => {
        if (!mapInstance) return;

        const handleMapClick = (event: L.LeafletMouseEvent) => {
            if (event.sourceTarget !== mapInstance) return;
            mapData.selectWaypoint(null);
            mapInstance.closePopup();
        };

        mapInstance.on("click", handleMapClick);

        return () => {
            mapInstance.off("click", handleMapClick);
        };
    }, [mapInstance, mapData.selectWaypoint]);

    useEffect(() => {
        if (!mapInstance || !mapData.bounds) return;

        const prevDay = prevSelectedDayRef.current;
        if (prevDay === mapData.selectedDay) return;

        prevSelectedDayRef.current = mapData.selectedDay;
        mapInstance.flyToBounds(mapData.bounds, {
            padding: FIT_BOUNDS_PADDING,
            maxZoom: 16,
            animate: true,
            duration: 0.6,
        });
    }, [mapInstance, mapData.bounds, mapData.selectedDay]);

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

    return (
        <div className={styles.mapPage}>
            <LeafletMapView
                bounds={mapData.bounds}
                onMapReady={handleMapReady}
                className={styles.mapContainer}
            >
                {(map) => (
                    <>
                        <ItineraryMarkersLayer
                            map={map}
                            waypoints={mapData.filteredWaypoints}
                            selectedIndex={mapData.selectedWaypointIndex}
                            onMarkerClick={handleMarkerClick}
                        />
                        <ItineraryRouteLayer
                            map={map}
                            path={mapData.routePath}
                            isHidden={isRouteHidden}
                        />
                    </>
                )}
            </LeafletMapView>

            <div className={styles.topBar}>
                <Button
                    style={["tool_bordered"]}
                    to={`/itineraries/${itineraryId}`}
                    ariaLabel="Volver al detalle del itinerario"
                >
                    <ChevronLeft size={20} />
                </Button>
                <Button
                    style={["tool_bordered"]}
                    onClick={recenter}
                    ariaLabel="Recentrar mapa"
                >
                    <LocateFixedIcon size={18} />
                </Button>
            </div>

            <MapBottomSheet
                waypoints={mapData.filteredWaypoints}
                dayNumbers={mapData.dayNumbers}
                selectedDay={mapData.selectedDay}
                onDayChange={mapData.setSelectedDay}
                selectedWaypointIndex={mapData.selectedWaypointIndex}
                onSelectWaypoint={handleCardSelect}
                invalidCount={mapData.invalidCount}
                itineraryTitle={itinerary.title}
            />
        </div>
    );
}
