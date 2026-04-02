import { useEffect, useRef } from "react";
import L from "leaflet";

import type { MapSuggestion } from "@/types/map";
import buttonStyles from "@styles/components/shared/Button.module.css";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

interface ExploreMarkersLayerProps {
    map: L.Map;
    places: MapSuggestion[];
    selectedIndex: number | null;
    onSelect: (index: number) => void;
    onAddToTrip: (index: number) => void;
    onNavigate: (index: number) => void;
    userCoords?: { latitude: number; longitude: number } | null;
}

const markerIcon = L.divIcon({
    className: "explore-marker",
    html: "<span class=\"map-pin-dot\"></span>",
    iconSize: [16, 16],
    iconAnchor: [10, 10],
});

const selectedMarkerIcon = L.divIcon({
    className: "explore-marker explore-marker-selected",
    html: "<span class=\"map-pin-dot\"></span>",
    iconSize: [16, 16],
    iconAnchor: [10, 10],
});

export default function ExploreMarkersLayer({
    map,
    places,
    selectedIndex,
    onSelect,
    onAddToTrip,
    onNavigate,
    userCoords,
}: ExploreMarkersLayerProps) {
    const markersRef = useRef<L.Marker[]>([]);

    const toRadians = (value: number) => (value * Math.PI) / 180;
    const computeDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const radius = 6371;
        const deltaLat = toRadians(lat2 - lat1);
        const deltaLon = toRadians(lon2 - lon1);
        const a = Math.sin(deltaLat / 2) ** 2
            + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
        return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    useEffect(() => {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        markersRef.current = places
            .map((place, index) => {
                if (!place.center) {
                    return null;
                }

                const icon = selectedIndex === index ? selectedMarkerIcon : markerIcon;
                const title = escapeHtml(place.name || "Lugar");
                const address = escapeHtml(place.fullAddress || place.placeFormatted || "Sin direccion");
                const distanceLabel = userCoords
                    ? `${computeDistanceKm(
                        userCoords.latitude,
                        userCoords.longitude,
                        place.center.latitude,
                        place.center.longitude
                    ).toFixed(1)} km`
                    : null;
                const marker = L.marker([place.center.latitude, place.center.longitude], { icon })
                    .addTo(map)
                    .bindPopup(
                        `<div class="explore-popup-card" data-popup-index="${index}">
                            <div class="explore-popup-head">
                                <strong>${title}</strong>
                            </div>
                            <span class="explore-popup-location">${address}</span>
                            <div class="explore-popup-extra">
                                ${distanceLabel ? `<span class="explore-popup-meta">${escapeHtml(distanceLabel)}</span>` : ""}
                            </div>
                            <div class="explore-popup-actions">
                                <button type="button" class="${buttonStyles.button} ${buttonStyles.small} ${buttonStyles.primary} explore-popup-action-primary" data-popup-add="${index}">Agregar al viaje</button>
                                <button type="button" class="${buttonStyles.button} ${buttonStyles.small} ${buttonStyles.secondary} explore-popup-action-secondary" data-popup-nav="${index}">Navegar</button>
                            </div>
                        </div>`,
                        { closeButton: false, autoPan: true, className: "explore-map-popup" }
                    );

                marker.on("click", () => onSelect(index));
                marker.on("popupopen", () => {
                    const popupRoot = marker.getPopup()?.getElement();
                    if (!popupRoot) return;

                    const addButton = popupRoot.querySelector<HTMLButtonElement>(`[data-popup-add="${index}"]`);
                    const navButton = popupRoot.querySelector<HTMLButtonElement>(`[data-popup-nav="${index}"]`);

                    addButton && (addButton.onclick = (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onAddToTrip(index);
                    });

                    navButton && (navButton.onclick = (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onNavigate(index);
                    });
                });
                marker.setZIndexOffset(selectedIndex === index ? 1200 : 700);
                return marker;
            })
            .filter((marker): marker is L.Marker => marker !== null);

        return () => {
            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];
        };
    }, [map, places, selectedIndex, onSelect, onAddToTrip, onNavigate, userCoords]);

    useEffect(() => {
        if (selectedIndex === null) {
            return;
        }

        const marker = markersRef.current[selectedIndex];
        if (marker) {
            marker.openPopup();
        }
    }, [selectedIndex]);

    return null;
}
