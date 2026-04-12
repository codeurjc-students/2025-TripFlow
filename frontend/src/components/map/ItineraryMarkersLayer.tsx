import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapWaypoint } from "@/utils/mapGeometry";

function escapeHtml(value: unknown) {
    const normalized = typeof value === "string" ? value : value == null ? "" : String(value);
    return normalized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function createMarkerIcon(size: number, selected = false) {
    return L.divIcon({
        className: `itinerary-marker ${selected ? "itinerary-marker-selected" : ""}`,
        html: '<span class="itinerary-marker-dot"></span>',
        iconSize: [size, size],
        iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
        popupAnchor: [0, -Math.round(size / 2)],
    });
}

const DefaultIcon = createMarkerIcon(18, false);
const SelectedIcon = createMarkerIcon(22, true);

interface ItineraryMarkersLayerProps {
    map: L.Map;
    waypoints: MapWaypoint[];
    selectedIndex: number | null;
    onMarkerClick: (index: number) => void;
}

export default function ItineraryMarkersLayer({
    map,
    waypoints,
    selectedIndex,
    onMarkerClick,
}: ItineraryMarkersLayerProps) {
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const newMarkers = waypoints.map((wp, index) => {
            const icon = index === selectedIndex ? SelectedIcon : DefaultIcon;
            const title = escapeHtml(wp.activity.activity || "Actividad");
            const location = escapeHtml(wp.activity.location.name || "Ubicacion");
            const time = wp.activity.time ? escapeHtml(wp.activity.time) : "";
            const marker = L.marker(wp.position, { icon })
                .addTo(map)
                .bindPopup(
                    `<div class="itinerary-popup-content">
                        <strong>${title}</strong>
                        <span class="itinerary-popup-location">${location}</span>
                        ${time ? `<span class="itinerary-popup-meta">${time}</span>` : ""}
                        <span class="itinerary-popup-meta">Día ${wp.dayNumber}</span>
                    </div>`,
                    { closeButton: true, autoPan: true, className: "itinerary-map-popup" }
                );

            if (index === selectedIndex) {
                marker.setZIndexOffset(1000);
            }

            marker.on("click", () => onMarkerClick(index));
            return marker;
        });

        markersRef.current = newMarkers;

        return () => {
            newMarkers.forEach((m) => m.remove());
        };
    }, [map, waypoints, selectedIndex, onMarkerClick]);

    useEffect(() => {
        if (selectedIndex !== null && markersRef.current[selectedIndex]) {
            markersRef.current[selectedIndex].openPopup();
        }
    }, [selectedIndex]);

    return null;
}
