import { useCallback, useEffect, useRef, useState } from "react";
import type L from "leaflet";

import type { ExtendedItinerary } from "@/types/itinerary";
import type { MapDirectionsProfile } from "@/types/map";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getItineraryById } from "@/services/itineraryService";
import { DEFAULT_DIRECTIONS_PROFILE, useDirectionsRoutePath } from "@/hooks/useDirectionsRoutePath";
import { useItineraryMapData } from "@/hooks/useItineraryMapData";
import { FIT_BOUNDS_PADDING } from "@/utils/mapGeometry";
import { useRecenter } from "@/components/map/LeafletMapView";
import { retrieveFromLocalStorage, saveToLocalStorage } from "@/utils/localStorageUtils";

const PROFILE_STORAGE_KEY = `${STORAGE_KEYS.ITINERARY_MAP_PROFILE_PREFIX}`;

function isValidDirectionsProfile(profile: string): profile is MapDirectionsProfile {
    return profile === "DRIVING"
        || profile === "DRIVING_TRAFFIC"
        || profile === "WALKING"
        || profile === "CYCLING";
}

export function useItineraryMapPage(itineraryId: number) {
    const [itinerary, setItinerary] = useState<ExtendedItinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [isRouteHidden, setIsRouteHidden] = useState(false);
    const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);
    const [directionsProfile, setDirectionsProfile] = useState<MapDirectionsProfile>(DEFAULT_DIRECTIONS_PROFILE);

    const mapData = useItineraryMapData(itinerary);
    const directionsRoute = useDirectionsRoutePath(mapData.filteredWaypoints, directionsProfile);
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

        void fetchItinerary();
    }, [itineraryId]);

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

    const toggleBottomPanel = useCallback(() => {
        setIsBottomPanelCollapsed((value) => !value);
    }, []);

    useEffect(() => {
        const persistedProfile = retrieveFromLocalStorage<string>(PROFILE_STORAGE_KEY);
        if (!persistedProfile || !isValidDirectionsProfile(persistedProfile)) {
            return;
        }
        setDirectionsProfile(persistedProfile);
    }, []);

    useEffect(() => {
        saveToLocalStorage(PROFILE_STORAGE_KEY, directionsProfile);
    }, [directionsProfile]);

    return {
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
    };
}
